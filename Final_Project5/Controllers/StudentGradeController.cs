﻿
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
        [HttpGet("grades")]
        public async Task<IActionResult> GetStudentGrades(string classId, string subjectId)
        {
            // Lấy danh sách điểm của học sinh theo lớp và môn học
            var studentGrades = await SLL1.TblStudentGrades
            .Include(sg => sg.StugStu)
            .Include(sg => sg.StugGc)
            .ThenInclude(gc => gc.GcSj)
            .Where(sg => sg.StugStu.StuCId == classId && sg.StugGc.GcSjId == subjectId)
            .GroupBy(sg => new { sg.StugStu.StuId, sg.StugStu.StuName })
            .Select(g => new
            {
                stu_id = g.Key.StuId,
                stu_name = g.Key.StuName,
                grades = g.Select(x => new
                {
                    gc_name = x.StugGc.GcName,
                    stug_grade = x.StugGrade,
                    gc_weight = x.StugGc.GcWeight
                }).ToList(),
                finalGrade = g.Sum(x => x.StugGrade * x.StugGc.GcWeight) / 100.0
            })
            .ToListAsync();


            // Nếu không có dữ liệu điểm, trả về lỗi 404
            if (studentGrades == null || studentGrades.Count == 0)
            {
                return NotFound("Không có dữ liệu điểm.");
            }

            // Trả về dữ liệu điểm học sinh
            return Ok(studentGrades);
        }

        [HttpPost("save-multiple")]
        public IActionResult SaveMultiple(
      [FromQuery] string sID,
      [FromQuery] string gcIDs,
      [FromQuery] string grades
  )
        {
            try
            {
                var gcIdList = gcIDs.Split(',');
                var gradeList = grades.Split(',').Select(g => double.Parse(g)).ToList();

                if (gcIdList.Length != gradeList.Count)
                {
                    return BadRequest("Số lượng gcIDs và grades không khớp.");
                }

                for (int i = 0; i < gcIdList.Length; i++)
                {
                    var gcId = gcIdList[i];
                    var grade = gradeList[i];

                    if (grade < 0 || grade > 10)
                    {
                        return BadRequest($"Điểm tại vị trí {i + 1} không hợp lệ: {grade}. Phải nằm trong khoảng từ 0 đến 10.");
                    }

                    var existingGrade = SLL1.TblStudentGrades
                        .FirstOrDefault(g => g.StugStuId == sID && g.StugGcId == gcId);

                    if (existingGrade != null)
                    {
                        existingGrade.StugGrade = grade;
                    }
                    else
                    {
                        var newGrade = new TblStudentGrade
                        {
                            StugId = Guid.NewGuid(),
                            StugStuId = sID,
                            StugGcId = gcId,
                            StugGrade = grade
                        };
                        SLL1.TblStudentGrades.Add(newGrade);
                    }
                }

                SLL1.SaveChanges();
                return Ok("Saved multiple successfully!");
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("by-student")]
        public async Task<IActionResult> GetGradesByStudent(string studentId)
        {
            var grades = await SLL1.TblStudentGrades
                .Include(sg => sg.StugGc)
                .ThenInclude(gc => gc.GcSj)
                .Where(sg => sg.StugStuId == studentId)
                .GroupBy(sg => new { sg.StugGc.GcSj.SjId, sg.StugGc.GcSj.SjName })
                .Select(g => new
                {
                    subject = g.Key.SjName,
                    components = g.Select(x => new
                    {
                        gc_name = x.StugGc.GcName,
                        stug_grade = x.StugGrade
                    }).ToList(),
                    finalGrade = g.Sum(x => x.StugGrade * x.StugGc.GcWeight) / 100.0
                })
                .ToListAsync();

            return Ok(grades);
        }
        [HttpGet("by-parent")]
        public async Task<IActionResult> GetGradesByParent(string parentId)
        {
            var students = await SLL1.TblStudents
                .Where(s => s.StuPId == parentId)
                .ToListAsync();

            if (students.Count == 0)
                return NotFound("Phụ huynh chưa có học sinh nào.");

            var result = new List<object>();

            foreach (var student in students)
            {
                var grades = await SLL1.TblStudentGrades
                    .Include(g => g.StugGc)
                    .Include(g => g.StugGc.GcSj)
                    .Where(g => g.StugStuId == student.StuId)
                    .GroupBy(g => g.StugGc.GcSj.SjName)
                    .Select(g => new {
                        subject = g.Key,
                        components = g.Select(x => new {
                            gc_name = x.StugGc.GcName,
                            stug_grade = x.StugGrade
                        }),
                        finalGrade = g.Sum(x => x.StugGrade * x.StugGc.GcWeight) / 100.0
                    })
                    .ToListAsync();

                result.Add(new
                {
                    studentId = student.StuId,
                    studentName = student.StuName,
                    grades = grades
                });
            }

            return Ok(result);
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
