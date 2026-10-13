using System.ComponentModel.DataAnnotations;

namespace Candidate.API.Database
{
    public class License : ISoftDeletable
    {
        public int LicenseId { get; set; }

        public int ProviderId { get; set; }

        [Required]
        [MaxLength(100)]
        public string LicenseNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LicenseStatus { get; set; } = "Active"; // Active, Expired, Suspended

        public DateTime ExpirationDate { get; set; }

        // Soft Delete
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAtUtc { get; set; }

        // Navigation
        public Provider? Provider { get; set; }
    }
}