
using Final_Project5.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Final_Project5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GradeComponentController : ControllerBase
    {
        N10Nhom3Context SLL1;

        public GradeComponentController(N10Nhom3Context sll)
        {
            SLL1 = sll;
        }

        [HttpGet]
        [Route("show")]
        public IActionResult Show()
        {
            try
            {
                return Ok(SLL1.TblGradeComponents.ToList());
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
        public IActionResult Insert([FromQuery] string id, [FromQuery] string subID, [FromQuery] string name, [FromQuery] double weight)
        {
            try
            {
                if (SLL1.TblGradeComponents.FirstOrDefault(p => p.GcId.Equals(id)) != null)
                {
                    return BadRequest("GradeComponent ID already exist!");
                }
                TblGradeComponent gc1 = new TblGradeComponent();
                gc1.GcId = id;
                gc1.GcName = name;
                gc1.GcWeight = weight;
                if (SLL1.TblSubjects.FirstOrDefault(s => s.SjId.Equals(subID)) == null)
                {
                    return BadRequest("Subject ID not found!");
                }
                gc1.GcSjId = subID;

                SLL1.TblGradeComponents.Add(gc1);
                SLL1.SaveChanges();

                return Ok("Added Succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when adding new Grade Component!");
            }
        }

        [HttpPost]
        [Route("update")]
        public IActionResult Update([FromQuery] string id, [FromQuery] string subID, [FromQuery] string name, [FromQuery] double weight)
        {
            try
            {
                TblGradeComponent gc1 = SLL1.TblGradeComponents.FirstOrDefault(p => p.GcId.Equals(id));
                if (gc1 == null)
                {
                    return BadRequest("Grade component ID not found!");
                }
                if (SLL1.TblSubjects.FirstOrDefault(p => p.SjId.Equals(subID)) == null)
                {
                    return BadRequest("Subject ID not found!");
                }
                gc1.GcName = name;
                gc1.GcSjId = subID;
                gc1.GcWeight = weight;

                SLL1.SaveChanges();
                return Ok("Updated Succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when update the Grade Component!");
            }
        }

        [HttpDelete]
        [Route("delete")]
        public IActionResult Delete([FromQuery] string id)
        {
            try
            {
                TblGradeComponent gc1 = SLL1.TblGradeComponents.FirstOrDefault(p => p.GcId.Equals(id));
                if (gc1 == null)
                {
                    return BadRequest("Grade Component ID not found!");
                }

                SLL1.TblGradeComponents.Remove(gc1);
                SLL1.SaveChanges();

                return Ok("Deleted succesfully!");
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx && sqlEx.Number == 208)
                {
                    return BadRequest("Cannot find table in database!");
                }
                return BadRequest("An error occurred when delete a Grade Component!");
            }
        }
    }
}
