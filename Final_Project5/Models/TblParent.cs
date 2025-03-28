using System;
using System.Collections.Generic;

namespace Final_Project5.Models;

public partial class TblParent
{
    public string PId { get; set; } = null!;

    public string PPassword { get; set; } = null!;

    public string PName { get; set; } = null!;

    public string PPhone { get; set; } = null!;

    public virtual ICollection<TblStudent> TblStudents { get; set; } = new List<TblStudent>();
}
