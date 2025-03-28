using System;
using System.Collections.Generic;

namespace Final_Project5.Models;

public partial class TblGradeComponent
{
    public string GcId { get; set; } = null!;

    public string? GcSjId { get; set; }

    public string GcName { get; set; } = null!;

    public double GcWeight { get; set; }

    public virtual TblSubject? GcSj { get; set; }

    public virtual ICollection<TblStudentGrade> TblStudentGrades { get; set; } = new List<TblStudentGrade>();
}
