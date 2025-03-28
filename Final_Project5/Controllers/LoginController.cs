
using Final_Project5.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Final_Project5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        IConfiguration _cfg;
        N10Nhom3Context SLL1;
        
        public LoginController(IConfiguration configuration, N10Nhom3Context SLL)
        {
            _cfg = configuration;
            SLL1 = SLL;
        }

        private string GetKey(string email, string password, string role, string id)
        {
            var jwtHandle = new JwtSecurityTokenHandler();
            var key = _cfg["jwtSetting:key"];
            var keybytes = Encoding.UTF8.GetBytes(key);

            var tokenDescription = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, email),
                    new Claim("tokenid", Guid.NewGuid().ToString()),
                    new Claim("permission", role),
                    new Claim (ClaimTypes.NameIdentifier,id)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(keybytes),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = jwtHandle.CreateToken(tokenDescription);

            return jwtHandle.WriteToken(token);
        }

        [HttpGet]
        [Route("loginAdmin")]
        public IActionResult LoginAdmin([FromQuery] string email,[FromQuery] string password)
        {
            TblAdmin a1 = SLL1.TblAdmins.FirstOrDefault(p => p.AEmail == email && p.APassword == password);
            if (a1 == null)
            {
                return BadRequest("Wrong email or password");
            }
            string keytoken = GetKey(email, password, "Admin", a1.AId);
            return Ok(new
            {
                code = 100,
                msg = "Login Succesfully!",
                token = keytoken
            });

        }

        [HttpGet]
        [Route("loginTeacher")]
        public IActionResult LoginTeacher([FromQuery] string email, [FromQuery] string password)
        {
            TblTeacher a1 = SLL1.TblTeachers.FirstOrDefault(p => p.TPhone == email && p.TPassword == password);
            if (a1 == null)
            {
                return BadRequest(new { code = 400, msg = "Wrong email or password" });
            }

            string keytoken = GetKey(email, password, "Teacher", a1.TId);

            return Ok(new
            {
                code = 100,
                msg = "Login Successfully!",
                token = keytoken,
                teacher = new
                {
                    id = a1.TId,
                    name = a1.TName,
                    phone = a1.TPhone
                }
            });
        }


        [HttpGet]
        [Route("loginParent")]
        public IActionResult LoginParent([FromQuery] string email, [FromQuery] string password)
        {
            TblParent a1 = SLL1.TblParents.FirstOrDefault(p => p.PPhone == email && p.PPassword == password);
            if (a1 == null)
            {
                return BadRequest("Wrong email or password");
            }

            string keytoken = GetKey(email, password, "Parent", a1.PId);

            return Ok(new
            {
                code = 100,
                msg = "Đăng nhập thành công",
                token = keytoken
            });

        }
    }
}
