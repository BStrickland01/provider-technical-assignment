using System.ComponentModel.DataAnnotations;

namespace Candidate.API.Database
{
    public class Provider : ISoftDeletable
    {
        public int ProviderId { get; set; }

        [Required]
        [MaxLength(200)]
        public string ProviderName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string County { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Active"; // Active, Inactive, Pending

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Soft Delete
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAtUtc { get; set; }

        // Navigation
        public ICollection<License> Licenses { get; set; } = new List<License>();
    }
}