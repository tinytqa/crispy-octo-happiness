using System;
using System.Collections.Generic;

namespace Final_Project5.Models;

public partial class TblTeacher
{
    public string TId { get; set; } = null!;

    public string TPassword { get; set; } = null!;

    public string TName { get; set; } = null!;

    public string TPhone { get; set; } = null!;

    public virtual ICollection<TblClass> TblClasses { get; set; } = new List<TblClass>();

    public virtual ICollection<TblTeacherSubject> TblTeacherSubjects { get; set; } = new List<TblTeacherSubject>();
}
