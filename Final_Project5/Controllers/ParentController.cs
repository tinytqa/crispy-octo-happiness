using Final_Project5.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Final_Project5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParentController : ControllerBase
    {
        N10Nhom3Context SLL1;

        public ParentController(N10Nhom3Context sll)
        {
            SLL1 = sll;
        }
        [HttpGet]
        [Route("show")]
        public IActionResult Show()
        {
            try
            {
                var parents = SLL1.TblParents
                    .Include(p => p.TblStudents) // Include danh sách học sinh
                    .Select(p => new
                    {
                        p.PId,
                        p.PName,
                        p.PPhone,
                        p.PPassword,
                        Students = p.TblStudents.Select(s => new { s.StuId, s.StuName }).ToList() // Lấy cả ID và Name
                    })
                    .ToList();

                return Ok(parents);
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
        public IActionResult Insert(
    [FromQuery] string id,
    [FromQuery] string pw,
    [FromQuery] string name,
    [FromQuery] string phone,
    [FromQuery] List<string> studentIds) // Nhận danh sách ID học sinh từ query string
        {
            try
            {
                // 1. Thêm phụ huynh mới vào tblParent
                TblParent p1 = new TblParent
                {
                    PId = id,
                    PName = name,
                    PPhone = phone,
                    PPassword = pw
                };

                SLL1.TblParents.Add(p1);
                SLL1.SaveChanges();

                // 2. Cập nhật danh sách học sinh nếu có
                if (studentIds != null && studentIds.Any())
                {
                    var students = SLL1.TblStudents
                        .Where(s => studentIds.Contains(s.StuId)) // Lọc danh sách học sinh
                        .ToList();

                    foreach (var student in students)
                    {
                        student.StuPId = id;  // Gán ID của phụ huynh mới
                    }

                    SLL1.SaveChanges();
                }

                return Ok("Added Successfully! Students updated.");
            }
            catch (DbUpdateException ex)
            {
                return BadRequest("An error occurred when adding new Parent!");
            }
        }

        [HttpPost]
        [Route("update")]
        public IActionResult Update(
     [FromQuery] string id,
     [FromQuery] string pw,
     [FromQuery] string name,
     [FromQuery] string phone,
     [FromQuery] List<string> studentIds) // Nhận danh sách ID học sinh mới
        {
            try
            {
                // 1. Tìm phụ huynh cần cập nhật
                TblParent p1 = SLL1.TblParents.FirstOrDefault(p => p.PId.Equals(id));
                if (p1 == null)
                {
                    return BadRequest("Parent ID not found!");
                }

                // 2. Cập nhật thông tin phụ huynh
                p1.PPassword = pw;
                p1.PName = name;
                p1.PPhone = phone;

                // 3. Nếu có danh sách học sinh, cập nhật lại liên kết
                if (studentIds != null && studentIds.Any())
                {
                    // Xóa liên kết cũ giữa phụ huynh và học sinh
                    var oldStudents = SLL1.TblStudents.Where(s => s.StuPId == id).ToList();
                    foreach (var student in oldStudents)
                    {
                        student.StuPId = null; // Gỡ liên kết với phụ huynh cũ
                    }

                    // Lấy danh sách học sinh mới từ database
                    var newStudents = SLL1.TblStudents
                        .Where(s => studentIds.Contains(s.StuId))
                        .ToList();

                    // Cập nhật liên kết với học sinh mới
                    foreach (var student in newStudents)
                    {
                        student.StuPId = id;
                    }
                }

                SLL1.SaveChanges();
                return Ok("Updated Successfully! Parent and students updated.");
            }
            catch (DbUpdateException ex)
            {
                return BadRequest("An error occurred when updating the Parent!");
            }
        }

        [HttpDelete]
        [Route("delete")]
        public IActionResult Delete([FromQuery] string id)
        {
            try
            {
                // 1. Kiểm tra xem Parent có tồn tại không
                var parent = SLL1.TblParents.FirstOrDefault(p => p.PId == id);
                if (parent == null)
                {
                    return NotFound("Parent ID not found!");
                }

                // 2. Kiểm tra và cập nhật danh sách học sinh trước khi xóa phụ huynh
                var students = SLL1.TblStudents.Where(s => s.StuPId == id).ToList();
                foreach (var student in students)
                {
                    student.StuPId = null; // Gỡ liên kết giữa học sinh và phụ huynh
                }

                // 3. Xóa phụ huynh khỏi bảng TblParents
                SLL1.TblParents.Remove(parent);
                SLL1.SaveChanges();

                return NoContent(); // HTTP 204: Xóa thành công, không có nội dung trả về
            }
            catch (DbUpdateException ex)
            {
                return BadRequest("An error occurred while deleting the Parent. Please check constraints!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal Server Error: " + ex.Message);
            }
        }
    }
}