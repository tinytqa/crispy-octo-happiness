
using Final_Project5.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Final_Project5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeacherController : ControllerBase
    {
        N10Nhom3Context SLL1;

        public TeacherController(N10Nhom3Context sll)
        {
            SLL1 = sll;
        }

        [HttpGet]
        [Route("show")]
        public IActionResult Show()
        {
            try
            {
                return Ok(SLL1.TblTeachers.ToList());
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when showing the table!");
            }
        }
        [HttpGet]
        [Route("showTeacherwithSubject")]
        public IActionResult showTeacherwithSubject () {
            var teachers = SLL1.TblTeachers
               .Include(t => t.TblTeacherSubjects)
                   .ThenInclude(ts => ts.TsjSj)
               .Select(t => new
               {
                   t.TId,
                   t.TName,
                   t.TPhone,
                   t.TPassword,
                   Subjects = t.TblTeacherSubjects
                       .Where(ts => ts.TsjSj != null)
                       .Select(ts => new { ts.TsjSj.SjId, ts.TsjSj.SjName })
                       .ToList()
               })
               .ToList();
            return Ok(teachers);
        }

        [HttpGet]
        [Route("showTeacherForParent")]
        public IActionResult ShowTeacherForParent([FromQuery] string className)
        {
            if (string.IsNullOrEmpty(className))
                return BadRequest("className is required.");

            var teachers = SLL1.TblTeachers
                .Include(t => t.TblTeacherSubjects)
                    .ThenInclude(ts => ts.TblTeacherSubjectClasses)
                        .ThenInclude(tsc => tsc.TscC) // navigation to tblClass
                .Include(t => t.TblTeacherSubjects)
                    .ThenInclude(ts => ts.TsjSj)
                .Where(t => t.TblTeacherSubjects
                    .Any(ts => ts.TblTeacherSubjectClasses
                        .Any(tsc => tsc.TscC.CName == className)))
                .Select(t => new
                {
                    t.TId,
                    t.TName,
                    t.TPhone,
                    Subjects = t.TblTeacherSubjects
                        .Where(ts => ts.TblTeacherSubjectClasses
                            .Any(tsc => tsc.TscC.CName == className))
                        .Select(ts => new
                        {
                            ts.TsjSj.SjId,
                            ts.TsjSj.SjName
                        })
                        .Distinct()
                        .ToList()
                })
                .ToList();

            return Ok(teachers);
        }




        [HttpPost]
        [Route("insert")]
        public IActionResult Insert(
    [FromQuery] string id,
    [FromQuery] string pw,
    [FromQuery] string name,
    [FromQuery] string phone,
    [FromQuery] string subjects)
        {
            try
            {
                // Tạo giáo viên mới
                var newTeacher = new TblTeacher
                {
                    TId = id,
                    TPassword = pw, // Cần mã hóa trước khi lưu
                    TName = name,
                    TPhone = phone
                };

                SLL1.TblTeachers.Add(newTeacher);
                SLL1.SaveChanges();

                // Nếu có danh sách môn học, thêm vào bảng tblTeacherSubject
                if (!string.IsNullOrEmpty(subjects))
                {
                    var subjectIds = subjects.Split(','); // Chia chuỗi subject thành danh sách
                    foreach (var subjectId in subjectIds)
                    {
                        var teacherSubject = new TblTeacherSubject
                        {
                            TsjId = Guid.NewGuid(), // Tạo ID mới
                            TsjTId = id,  // Liên kết với giáo viên
                            TsjSjId = subjectId // Liên kết với môn học
                        };
                        SLL1.TblTeacherSubjects.Add(teacherSubject);
                    }
                    SLL1.SaveChanges();
                }

                return Ok("Inserted Successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }


        [HttpPost("update")]
        public IActionResult Update(
     [FromQuery] string id,
     [FromQuery] string pw,
     [FromQuery] string name,
     [FromQuery] string phone,
     [FromQuery] string subjects) // Danh sách sj_id (VD: "Su001,Su002")
        {
            using var transaction = SLL1.Database.BeginTransaction();
            try
            {
                // 1️⃣ Tìm giáo viên
                var teacher = SLL1.TblTeachers
                    .Include(t => t.TblTeacherSubjects)
                    .FirstOrDefault(t => t.TId == id);

                if (teacher == null)
                {
                    return NotFound("Teacher ID not found!");
                }

                // 2️⃣ Cập nhật thông tin giáo viên
                teacher.TPassword = pw;
                teacher.TName = name;
                teacher.TPhone = phone;

                SLL1.SaveChanges(); // Lưu thay đổi thông tin giáo viên trước khi cập nhật môn học

                // 3️⃣ Cập nhật danh sách môn học
                if (!string.IsNullOrWhiteSpace(subjects))
                {
                    var subjectIds = subjects.Split(',').Select(s => s.Trim()).ToList();

                    // Lấy danh sách môn học hợp lệ từ database
                    var validSubjects = SLL1.TblSubjects
                        .Where(s => subjectIds.Contains(s.SjId))
                        .Select(s => s.SjId)
                        .ToList();

                    // Xóa môn học cũ
                    SLL1.TblTeacherSubjects.RemoveRange(teacher.TblTeacherSubjects);

                    // Thêm môn học mới
                    foreach (var sjId in validSubjects)
                    {
                        SLL1.TblTeacherSubjects.Add(new TblTeacherSubject
                        {
                            TsjId = Guid.NewGuid(),
                            TsjTId = id,
                            TsjSjId = sjId
                        });
                    }

                    SLL1.SaveChanges();
                }

                transaction.Commit();

                return Ok("Updated Successfully!");
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpDelete]
        [Route("delete")]
        public IActionResult Delete([FromQuery] string id)
        {
            try
            {
                TblTeacher t1 = SLL1.TblTeachers.FirstOrDefault(t => t.TId.Equals(id));
                if (t1 == null)
                {
                    return BadRequest("Teacher ID not found!");
                }

                SLL1.TblTeachers.Remove(t1);
                SLL1.SaveChanges();

                return Ok("Deleted succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when delete a Teacher!");
            }
        }
    }
}
