using Final_Project5.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Final_Project5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeacherSubjectClassController : ControllerBase
    {
        N10Nhom3Context SLL1;

        public TeacherSubjectClassController(N10Nhom3Context sll)
        {
            SLL1 = sll;
        }

        [HttpGet]
        [Route("show")]
        public IActionResult Show()
        {
            try
            {
                var result = SLL1.TblTeacherSubjectClasses
                    .Include(tsc => tsc.TscC) // Lấy thông tin Lớp
                    .Include(tsc => tsc.TscTsj)
                        .ThenInclude(tsj => tsj.TsjT) // Lấy thông tin Giáo viên
                    .Include(tsc => tsc.TscTsj)
                        .ThenInclude(tsj => tsj.TsjSj) // Lấy thông tin Môn học
                    .Select(tsc => new
                    {
                        TeacherName = tsc.TscTsj.TsjT.TName, // Tên giáo viên
                        ClassName = tsc.TscC.CName, // Tên lớp
                        SubjectName = tsc.TscTsj.TsjSj.SjName, // Tên môn học
                        tsc.TscId // ID dùng để xóa
                    })
                    .ToList();

                return Ok(result);
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
        [Authorize]
        [HttpGet("getClassesByTeacher")]
        public IActionResult GetClassesByTeacher()
        {
            // Lấy Teacher ID từ JWT Token
            var teacherId =  User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(teacherId))
            {
                return Unauthorized(new { message = "Bạn chưa đăng nhập" });
            }

            // Truy vấn danh sách lớp của giáo viên đang đăng nhập
            var classes = SLL1.TblTeacherSubjects
                .Where(ts => ts.TsjTId == teacherId) // Lọc theo TeacherID
                .SelectMany(ts => ts.TblTeacherSubjectClasses)
                .Select(tsc => new
                {
                    ClassId = tsc.TscCId,
                    ClassName = tsc.TscC.CName,
                    SubjectName = tsc.TscTsj.TsjSj.SjName
                })
                .ToList();

            return Ok(classes);
        }
        [Authorize]
        [HttpGet("getClassesByTeacher1")]
        public IActionResult GetClassesByTeacher1(string teacherId)
        {
            // Lấy Teacher ID từ JWT Token
          //  var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(teacherId))
            {
                return Unauthorized(new { message = "Bạn chưa đăng nhập" });
            }

            // Truy vấn danh sách lớp của giáo viên đang đăng nhập
            var classes = SLL1.TblTeacherSubjects
                .Where(ts => ts.TsjTId == teacherId) // Lọc theo TeacherID
                .SelectMany(ts => ts.TblTeacherSubjectClasses)
                .Select(tsc => new
                {
                    ClassId = tsc.TscCId,
                    ClassName = tsc.TscC.CName,
                    SubjectName = tsc.TscTsj.TsjSj.SjName
                })
                .ToList();

            return Ok(classes);
        }
        [HttpPost]
        [Route("insert")]
        public IActionResult Insert([FromQuery] Guid tsID, [FromQuery] string classID)
        {
            try
            {
                if (SLL1.TblClasses.FirstOrDefault(p => p.CId.Equals(classID)) == null)
                {
                    return BadRequest("Class ID not found!");
                }
                if (SLL1.TblTeacherSubjects.FirstOrDefault(p => p.TsjId == tsID) == null)
                {
                    return BadRequest("TeacherSubject ID not found!");
                }
                TblTeacherSubjectClass tsc1 = new TblTeacherSubjectClass();
                tsc1.TscId = Guid.NewGuid();
                tsc1.TscTsjId = tsID;
                tsc1.TscCId = classID;

                SLL1.TblTeacherSubjectClasses.Add(tsc1);
                SLL1.SaveChanges();

                return Ok("Inserted Succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occur when adding new TeacherClass!");
            }
        }

        [HttpPost]
        [Route("update")]
        public IActionResult Update([FromQuery] Guid id, [FromQuery] Guid tsID, [FromQuery] string classID)
        {
            try
            {
                TblTeacherSubjectClass tsc1 = SLL1.TblTeacherSubjectClasses.FirstOrDefault(t => t.TscId == id);
                if (tsc1 == null)
                {
                    return BadRequest("TeacherSubjectClass ID not found!");
                }
                if (SLL1.TblTeacherSubjects.FirstOrDefault(p => p.TsjId == tsID) == null)
                {
                    return BadRequest("Teacher ID not found!");
                }
                if (SLL1.TblClasses.FirstOrDefault(p => p.CId.Equals(classID)) == null)
                {
                    return BadRequest("Class ID not found!");
                }
                tsc1.TscTsjId = tsID;
                tsc1.TscCId = classID;

                SLL1.SaveChanges();
                return Ok("Updated Succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when update a TeacherClass!");
            }
        }

        [HttpDelete]
        [Route("delete")]
        public IActionResult Delete([FromQuery] Guid id)
        {
            try
            {
                TblTeacherSubjectClass tsc1 = SLL1.TblTeacherSubjectClasses.FirstOrDefault(t => t.TscId == id);
                if (tsc1 == null)
                {
                    return BadRequest("TeacherSubjectClass ID not found!");
                }

                SLL1.TblTeacherSubjectClasses.Remove(tsc1);
                SLL1.SaveChanges();

                return Ok("Deleted succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when delete a TeacherClass!");
            }
        }
    }
}
