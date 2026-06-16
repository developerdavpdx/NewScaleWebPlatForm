using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PTM.Models
{
    public class BitacoraAsignLinie
    {
        public int Id { get; set; }
        public int Linea { get; set; }
        public string codigoItem { get; set; }
        public string trabajador { get; set; }

        public DateTime FechaAsignacion { get; set; }
    }

    public class UserIdentity
    {
        public string Name { get; set; }
        public string Id { get; set; }
        public string UserName { get; set; }
        public string NormalizedUserName { get; set; }
        public string Email { get; set; }
        public string NormalizedEmail { get; set; }
        public bool EmailConfirmed { get; set; }
        public string PasswordHash { get; set; }
        public string SecurityStamp { get; set; }
        public string ConcurrencyStamp { get; set; }
        public string PhoneNumber { get; set; }
        public bool PhoneNumberConfirmed { get; set; }
        public bool TwoFactorEnabled { get; set; }
        public DateTime? LockoutEnd { get; set; }
        public bool LockoutEnabled { get; set; }
        public int AccessFailedCount { get; set; }
    }

    public class BitacoraList
    {
        public List<BitacoraAsignLinie> Bitacora { get; set; }
    }
}