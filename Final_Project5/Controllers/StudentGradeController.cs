
using Final_Project5.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Final_Project5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentGradeController : ControllerBase
    {
        N10Nhom3Context SLL1;

        public StudentGradeController(N10Nhom3Context sll)
        {
            SLL1 = sll;
        }

        [HttpGet]
        [Route("show")]
        public IActionResult Show()
        {
            try
            {
                return Ok(SLL1.TblStudentGrades.ToList());
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

        [HttpPost]
        [Route("insert")]
        public IActionResult Insert([FromQuery] string sID, [FromQuery] int grade, [FromQuery] string gcID)
        {
            try
            {
                if (SLL1.TblStudents.FirstOrDefault(s => s.StuId.Equals(sID)) == null)
                {
                    return BadRequest("Student ID not found!");
                }
                if (SLL1.TblGradeComponents.FirstOrDefault(s => s.GcId.Equals(gcID)) == null)
                {
                    return BadRequest("GradeComponent ID not found!");
                }
                TblStudentGrade sg1 = new TblStudentGrade();
                sg1.StugId = Guid.NewGuid();
                sg1.StugGrade = grade;
                sg1.StugGcId = gcID;
                sg1.StugStuId = sID;

                SLL1.TblStudentGrades.Add(sg1);
                SLL1.SaveChanges();

                return Ok("Inserted Succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when adding new StudentGrade!");
            }
        }

        [HttpPost]
        [Route("update")]
        public IActionResult Update([FromQuery] Guid id, [FromQuery] string sID, [FromQuery] int grade, [FromQuery] string gcID)
        {
            try
            {
                TblStudentGrade sg1 = SLL1.TblStudentGrades.FirstOrDefault(s => s.StugId == id);
                if (sg1 == null)
                {
                    return BadRequest("StudentGrade ID not found!");
                }
                if (SLL1.TblStudents.FirstOrDefault(s => s.StuId.Equals(sID)) == null)
                {
                    return BadRequest("Student ID not found!");
                }
                if (SLL1.TblGradeComponents.FirstOrDefault(s => s.GcId.Equals(gcID)) == null)
                {
                    return BadRequest("GradeComponent ID not found!");
                }
                sg1.StugGrade = grade;
                sg1.StugGcId = gcID;
                sg1.StugStuId = sID;

                SLL1.SaveChanges();
                return Ok("Updated Succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when update the StudentGrade!");
            }
        }

        [HttpDelete]
        [Route("delete")]
        public IActionResult Delete([FromQuery] Guid id)
        {
            try
            {
                TblStudentGrade sg1 = SLL1.TblStudentGrades.FirstOrDefault(s => s.StugId == id);
                if (sg1 == null)
                {
                    return BadRequest("StudentGrade ID not found!");
                }

                SLL1.TblStudentGrades.Remove(sg1);
                SLL1.SaveChanges();

                return Ok("Deleted succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when delete a StudentGrade!");
            }
        }
    }
}
