using Microsoft.EntityFrameworkCore;

namespace Candidate.API.Database
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Providers.IgnoreQueryFilters().Any())
            {
                return;
            }

            var providers = new[]
            {
                new Provider
                {
                    ProviderName = "Metro Health Services",
                    County = "Fulton",
                    Status = "Active",
                    CreatedDate = DateTime.UtcNow.AddMonths(-12),
                    Licenses = new List<License>
                    {
                        new License { LicenseNumber = "LIC-1001", LicenseStatus = "Active", ExpirationDate = DateTime.UtcNow.AddYears(1) },
                        new License { LicenseNumber = "LIC-1002", LicenseStatus = "Active", ExpirationDate = DateTime.UtcNow.AddMonths(6) }
                    }
                },
                new Provider
                {
                    ProviderName = "Piedmont Community Care",
                    County = "DeKalb",
                    Status = "Active",
                    CreatedDate = DateTime.UtcNow.AddMonths(-8),
                    Licenses = new List<License>
                    {
                        new License { LicenseNumber = "LIC-2001", LicenseStatus = "Expired", ExpirationDate = DateTime.UtcNow.AddDays(-30) }
                    }
                },
                new Provider
                {
                    ProviderName = "Gwinnett Family Clinic",
                    County = "Gwinnett",
                    Status = "Pending",
                    CreatedDate = DateTime.UtcNow.AddDays(-10),
                    Licenses = new List<License>()
                },
                new Provider
                {
                    ProviderName = "Legacy Care Partners",
                    County = "Cobb",
                    Status = "Active",
                    CreatedDate = DateTime.UtcNow.AddYears(-2),
                    IsDeleted = true,
                    DeletedAtUtc = DateTime.UtcNow.AddDays(-5),
                    Licenses = new List<License>
                    {
                        new License { LicenseNumber = "LIC-9001", LicenseStatus = "Suspended", ExpirationDate = DateTime.UtcNow.AddDays(-100), IsDeleted = true, DeletedAtUtc = DateTime.UtcNow.AddDays(-5) }
                    }
                }
            };

            context.Providers.AddRange(providers);
            context.SaveChanges();
        }
    }
}