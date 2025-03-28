using System;
using System.Collections.Generic;

namespace Final_Project5.Models;

public partial class TblTeacherSubjectClass
{
    public Guid TscId { get; set; }

    public Guid? TscTsjId { get; set; }

    public string? TscCId { get; set; }

    public virtual TblClass? TscC { get; set; }

    public virtual TblTeacherSubject? TscTsj { get; set; }
}
