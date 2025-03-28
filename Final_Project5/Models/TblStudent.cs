using System;
using System.Collections.Generic;

namespace Final_Project5.Models;

public partial class TblStudent
{
    public string StuId { get; set; } = null!;

    public string StuName { get; set; } = null!;

    public int StuGradeLevel { get; set; }

    public string StuDob { get; set; } = null!;

    public string? StuCId { get; set; }

    public string? StuPId { get; set; }

    public virtual TblClass? StuC { get; set; }

    public virtual TblParent? StuP { get; set; }

    public virtual ICollection<TblStudentGrade> TblStudentGrades { get; set; } = new List<TblStudentGrade>();
}
