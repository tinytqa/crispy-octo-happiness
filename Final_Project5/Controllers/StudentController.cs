
using Final_Project5.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Final_Project5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        N10Nhom3Context SLL1;

        public StudentController(N10Nhom3Context sll)
        {
            SLL1 = sll;
        }

        [HttpGet]
        [Route("show")]
        public IActionResult Show()
        {
            try
            {
                var students = SLL1.TblStudents
            .Include(s => s.StuC) // Load thông tin class
            .Select(s => new
            {
                s.StuId,
                s.StuName,
                s.StuGradeLevel,
                s.StuDob,
                s.StuP,
                ClassId = s.StuC != null ? s.StuC.CId : null, // Lấy ID của lớp học
                ClassName = s.StuC != null ? s.StuC.CName : null, // Lấy tên lớp học
            })
            .ToList();

                return Ok(students);
                //return Ok(SLL1.TblStudents.ToList());
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
        public IActionResult Insert([FromQuery] string id, [FromQuery] string name, [FromQuery] int grade, [FromQuery] string dob, [FromQuery] string cID)
        {

            TblStudent stu1 = new TblStudent();
            stu1.StuId = id;
            stu1.StuName = name;
            stu1.StuGradeLevel = grade;
            stu1.StuDob = dob;
            if (SLL1.TblClasses.FirstOrDefault(p => p.CId.Equals(cID)) == null)
            {
                return BadRequest("Class ID not found!");
            }
            stu1.StuCId = cID;

            SLL1.TblStudents.Add(stu1);
            SLL1.SaveChanges();

            return Ok("Inserted Succesfully!");

        }

        [HttpPost]
        [Route("update")]
        public IActionResult Update([FromQuery] string id, [FromQuery] string name, [FromQuery] int grade, [FromQuery] string dob, [FromQuery] string cID)
        {
            try
            {
                TblStudent stu1 = SLL1.TblStudents.FirstOrDefault(s => s.StuId.Equals(id));
                if (stu1 == null)
                {
                    return BadRequest("Student ID not found!");
                }

                if (SLL1.TblClasses.FirstOrDefault(p => p.CId.Equals(cID)) == null)
                {
                    return BadRequest("Class ID not found!");
                }

                stu1.StuName = name;
                stu1.StuGradeLevel = grade;
                stu1.StuDob = dob;
                stu1.StuCId = cID;

                SLL1.SaveChanges();
                return Ok("Updated Successfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when updating the Student!");
            }
        }


        [HttpDelete]
        [Route("delete")]
        public IActionResult Delete([FromQuery] string id)
        {
            try
            {
                TblStudent stu1 = SLL1.TblStudents.FirstOrDefault(s => s.StuId.Equals(id));
                if (stu1 == null)
                {
                    return BadRequest("Student ID not found!");
                }

                SLL1.TblStudents.Remove(stu1);
                SLL1.SaveChanges();

                return Ok("Deleted succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when delete a Student!");
            }
        }
    }
}
