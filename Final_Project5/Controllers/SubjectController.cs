
using Final_Project5.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Final_Project5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectController : ControllerBase
    {
        N10Nhom3Context SLL1;

        public SubjectController(N10Nhom3Context sll)
        {
            SLL1 = sll;
        }

        [HttpGet]
        [Route("show")]
        public IActionResult Show()
        {
            try
            {
                return Ok(SLL1.TblSubjects.ToList());
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
        public IActionResult Insert([FromQuery] string id, [FromQuery] string name)
        {
            try
            {
                TblSubject s1 = new TblSubject();
                s1.SjId = id;
                s1.SjName = name;
                if (SLL1.TblSubjects.FirstOrDefault(s => s.SjId.Equals(id)) != null)
                {
                    return BadRequest("Subject ID already exist!");
                }

                SLL1.TblSubjects.Add(s1);
                SLL1.SaveChanges();

                return Ok("Added Succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when adding new Subject!");
            }
        }

        [HttpPost]
        [Route("update")]
        public IActionResult Update([FromQuery] string id, [FromQuery] string name)
        {
            try
            {
                TblSubject s1 = SLL1.TblSubjects.FirstOrDefault(p => p.SjId.Equals(id));
                if (s1 == null)
                {
                    return BadRequest("Subject ID not found!");
                }
                s1.SjName = name;

                SLL1.SaveChanges();
                return Ok("Updated Succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when update the Subject!");
            }
        }

        [HttpDelete]
        [Route("delete")]
        public IActionResult Delete([FromQuery] string id)
        {
            try
            {
                TblSubject s1 = SLL1.TblSubjects.FirstOrDefault(p => p.SjId.Equals(id));
                if (s1 == null)
                {
                    return BadRequest("Subject ID not found!");
                }

                SLL1.TblSubjects.Remove(s1);
                SLL1.SaveChanges();

                return Ok("Deleted succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when delete a Subject!");
            }
        }
    }
}
