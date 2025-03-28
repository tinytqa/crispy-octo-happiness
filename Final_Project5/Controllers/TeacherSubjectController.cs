
using Final_Project5.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Final_Project5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeacherSubjectController : ControllerBase
    {
        N10Nhom3Context SLL1;

        public TeacherSubjectController(N10Nhom3Context sll)
        {
            SLL1 = sll;
        }

        [HttpGet]
        [Route("show")]
        public IActionResult Show()
        {
            try
            {
                return Ok(SLL1.TblTeacherSubjects.ToList());
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
        [HttpGet("GetSubjectsByTeacher")]
        public IActionResult GetSubjectsByTeacher(string teacherId)
        {
            try
            {
                var subjects = SLL1.TblTeacherSubjects
                    .Where(ts => ts.TsjTId == teacherId)
                    .Select(ts => new
                    {
                        TsId = ts.TsjId,         // ID của TeacherSubject
                        TsSjId = ts.TsjSjId,     // ID môn học
                        SjName = ts.TsjSj.SjName // Tên môn học từ bảng Subject
                    })
                    .ToList();

                return Ok(subjects);
            }
            catch (Exception ex)
            {
                return BadRequest("Lỗi khi lấy danh sách môn học của giáo viên.");
            }
        }


        [HttpPost]
        [Route("insert")]
        public IActionResult Insert([FromQuery] string teacherID, [FromQuery] string subjectID)
        {
            try
            {
                if (SLL1.TblTeachers.FirstOrDefault(p => p.TId.Equals(teacherID)) == null)
                {
                    return BadRequest("Teacher ID not found!");
                }
                if (SLL1.TblSubjects.FirstOrDefault(p => p.SjId.Equals(subjectID)) == null)
                {
                    return BadRequest("Subject ID not found!");
                }
                TblTeacherSubject ts1 = new TblTeacherSubject();
                ts1.TsjId = Guid.NewGuid();
                ts1.TsjTId = teacherID;
                ts1.TsjSjId = subjectID;

                SLL1.TblTeacherSubjects.Add(ts1);
                SLL1.SaveChanges();

                return Ok("Inserted Succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occur when adding new TeacherSubject!");
            }
        }

        [HttpPost]
        [Route("update")]
        public IActionResult Update([FromQuery] Guid id, [FromQuery] string teacherID, [FromQuery] string subjectID)
        {
            try
            {
                TblTeacherSubject ts1 = SLL1.TblTeacherSubjects.FirstOrDefault(t => t.TsjId == id);
                if (ts1 == null)
                {
                    return BadRequest("TeacherSubject ID not found!");
                }
                if (SLL1.TblTeachers.FirstOrDefault(p => p.TId.Equals(teacherID)) == null)
                {
                    return BadRequest("Teacher ID not found!");
                }
                if (SLL1.TblSubjects.FirstOrDefault(p => p.SjId.Equals(subjectID)) == null)
                {
                    return BadRequest("Subject ID not found!");
                }
                ts1.TsjTId = teacherID;
                ts1.TsjSjId = subjectID;

                SLL1.SaveChanges();
                return Ok("Updated Succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when update a TeacherSubject!");
            }
        }

        [HttpDelete]
        [Route("delete")]
        public IActionResult Delete([FromQuery] Guid id)
        {
            try
            {
                TblTeacherSubject ts1 = SLL1.TblTeacherSubjects.FirstOrDefault(t => t.TsjId == id);
                if (ts1 == null)
                {
                    return BadRequest("TeacherSubject ID not found!");
                }

                SLL1.TblTeacherSubjects.Remove(ts1);
                SLL1.SaveChanges();

                return Ok("Deleted succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when delete a TeacherSubject!");
            }
        }
        [HttpGet("get-tsj-id")]
        public IActionResult GetTeacherSubjectId(string teacherId, string subjectId)
        {
            var tsj = SLL1.TblTeacherSubjects
                        .Where(t => t.TsjTId == teacherId && t.TsjSjId == subjectId)
                        .Select(t => t.TsjId)
                        .FirstOrDefault();

            if (tsj == Guid.Empty)
                return BadRequest("Không tìm thấy TeacherSubjectId phù hợp.");

            return Ok(tsj);
        }

    }
}
