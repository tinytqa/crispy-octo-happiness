using System;
using System.Collections.Generic;

namespace Final_Project5.Models;

public partial class TblStudentGrade
{
    public Guid StugId { get; set; }

    public double StugGrade { get; set; }

    public string StugStuId { get; set; } = null!;

    public string StugGcId { get; set; } = null!;

    public virtual TblGradeComponent StugGc { get; set; } = null!;

    public virtual TblStudent StugStu { get; set; } = null!;
}
