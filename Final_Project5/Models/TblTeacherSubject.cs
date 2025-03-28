using System;
using System.Collections.Generic;

namespace Final_Project5.Models;

public partial class TblTeacherSubject
{
    public Guid TsjId { get; set; }

    public string? TsjTId { get; set; }

    public string? TsjSjId { get; set; }

    public virtual ICollection<TblTeacherSubjectClass> TblTeacherSubjectClasses { get; set; } = new List<TblTeacherSubjectClass>();

    public virtual TblSubject? TsjSj { get; set; }

    public virtual TblTeacher? TsjT { get; set; }
}
