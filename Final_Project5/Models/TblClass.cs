using System;
using System.Collections.Generic;

namespace Final_Project5.Models;

public partial class TblClass
{
    public string CId { get; set; } = null!;

    public string CName { get; set; } = null!;

    public string? CTId { get; set; }

    public virtual TblTeacher? CT { get; set; }

    public virtual ICollection<TblStudent> TblStudents { get; set; } = new List<TblStudent>();

    public virtual ICollection<TblTeacherSubjectClass> TblTeacherSubjectClasses { get; set; } = new List<TblTeacherSubjectClass>();
}
