using Microsoft.EntityFrameworkCore;

namespace Candidate.API.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Provider> Providers => Set<Provider>();
        public DbSet<License> Licenses => Set<License>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Provider Configuration
            modelBuilder.Entity<Provider>(entity =>
            {
                entity.HasKey(p => p.ProviderId);
                entity.Property(p => p.ProviderName).IsRequired().HasMaxLength(200);
                entity.Property(p => p.County).IsRequired().HasMaxLength(100);
                entity.Property(p => p.Status).IsRequired().HasMaxLength(50);
                entity.Property(p => p.CreatedDate).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(p => p.IsDeleted).HasDefaultValue(false);

                // Global Query Filter: exclude soft-deleted records from standard queries
                entity.HasQueryFilter(p => !p.IsDeleted);

                // Indexing for search & county lookups
                entity.HasIndex(p => p.ProviderName);
                entity.HasIndex(p => p.County);
                entity.HasIndex(p => p.IsDeleted);
            });

            // License Configuration
            modelBuilder.Entity<License>(entity =>
            {
                entity.HasKey(l => l.LicenseId);
                entity.Property(l => l.LicenseNumber).IsRequired().HasMaxLength(100);
                entity.Property(l => l.LicenseStatus).IsRequired().HasMaxLength(50);
                entity.Property(l => l.IsDeleted).HasDefaultValue(false);

                // Global Query Filter
                entity.HasQueryFilter(l => !l.IsDeleted);

                entity.HasOne(l => l.Provider)
                      .WithMany(p => p.Licenses)
                      .HasForeignKey(l => l.ProviderId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(l => l.LicenseNumber);
                entity.HasIndex(l => l.ExpirationDate);
                entity.HasIndex(l => l.IsDeleted);
            });
        }

        public override int SaveChanges()
        {
            ApplySoftDeleteRules();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplySoftDeleteRules();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void ApplySoftDeleteRules()
        {
            var deletedEntries = ChangeTracker.Entries<ISoftDeletable>()
                .Where(e => e.State == EntityState.Deleted);

            foreach (var entry in deletedEntries)
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.DeletedAtUtc = DateTime.UtcNow;

                // Cascade soft-delete licenses if provider is soft-deleted
                if (entry.Entity is Provider provider)
                {
                    var licenses = Entry(provider)
                        .Collection(p => p.Licenses)
                        .Query()
                        .ToList();

                    foreach (var license in licenses)
                    {
                        license.IsDeleted = true;
                        license.DeletedAtUtc = DateTime.UtcNow;
                    }
                }
            }
        }
    }
}