using System;
using System.Collections.Generic;

namespace Final_Project5.Models;

public partial class TblSubject
{
    public string SjId { get; set; } = null!;

    public string SjName { get; set; } = null!;

    public virtual ICollection<TblGradeComponent> TblGradeComponents { get; set; } = new List<TblGradeComponent>();

    public virtual ICollection<TblTeacherSubject> TblTeacherSubjects { get; set; } = new List<TblTeacherSubject>();
}
