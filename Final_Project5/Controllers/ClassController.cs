
using Final_Project5.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Final_Project5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClassController : ControllerBase
    {
        N10Nhom3Context N10Nhom3Context;

        public ClassController(N10Nhom3Context sll)
        {
            N10Nhom3Context = sll;
        }

        [HttpGet]
        [Route("show")]
        public IActionResult Show()
        {
            try
            {

                var classes = N10Nhom3Context.TblClasses
                       .Select(c => new
                       {
                           c.CId,
                           c.CName,
                           c.CTId,
                           TeacherName = N10Nhom3Context.TblTeachers
                                           .Where(t => t.TId == c.CTId)
                                           .Select(t => t.TName)
                                           .FirstOrDefault()
                       })
                       .ToList();

                return Ok(classes);
                //return Ok(SLL1.TblClasses.ToList());
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
        public IActionResult Insert([FromQuery] string id, [FromQuery] string name, [FromQuery] string tID)
        {
            try
            {
                if (N10Nhom3Context.TblTeachers.FirstOrDefault(p => p.TId.Equals(tID)) == null)
                {
                    return BadRequest("Teacher ID not found!");
                }
                TblClass c1 = new TblClass();
                c1.CId = id;
                c1.CName = name;
                c1.CTId = tID;
                if (N10Nhom3Context.TblClasses.FirstOrDefault(s => s.CId == id) != null)
                {
                    return BadRequest("Class already exist!");
                }

                N10Nhom3Context.TblClasses.Add(c1);
                N10Nhom3Context.SaveChanges();

                return Ok("Added Succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when adding new Class!");
            }
        }

        [HttpPost]
        [Route("update")]
        public IActionResult Update([FromQuery] string id, [FromQuery] string name, [FromQuery] string tID)
        {

            if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(tID))
            {
                return BadRequest("Invalid input data!");
            }

            TblClass c1 = N10Nhom3Context.TblClasses.FirstOrDefault(p => p.CId.Equals(id));
            if (c1 == null)
            {
                return BadRequest("Class ID not found!");
            }
            if (N10Nhom3Context.TblTeachers.FirstOrDefault(p => p.TId.Equals(tID)) == null)
            {
                return BadRequest("Teacher ID not found!");
            }

            c1.CName = name;
            c1.CTId = tID; // Sửa lại đúng biến cần cập nhật

            N10Nhom3Context.SaveChanges();
            return Ok("Updated Successfully!");
        }

        [HttpDelete]
        [Route("delete")]
        public IActionResult Delete([FromQuery] string id)
        {
            try
            {
                TblClass c1 = N10Nhom3Context.TblClasses.FirstOrDefault(p => p.CId.Equals(id));
                if (c1 == null)
                {
                    return BadRequest("Class ID not found!");
                }

                N10Nhom3Context.TblClasses.Remove(c1);
                N10Nhom3Context.SaveChanges();

                return Ok("Deleted succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when delete a Class!");
            }
        }
        [HttpGet]
        [Route("students")]
        public IActionResult GetStudentsByClass([FromQuery] string classId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(classId))
                {
                    return BadRequest("Class ID is required!");
                }

                var students = N10Nhom3Context.TblStudents
                                   .Where(s => s.StuCId == classId)
                                   .Select(s => new
                                   {
                                       s.StuId,
                                       s.StuName,
                                       s.StuDob
                                   })
                                   .ToList();

                if (!students.Any())
                {
                    return NotFound("No students found for this class!");
                }

                return Ok(students);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when retrieving students!");
            }
        }



    }
}
