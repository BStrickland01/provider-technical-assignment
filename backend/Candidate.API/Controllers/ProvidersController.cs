using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Candidate.API.Database;

namespace Candidate.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProvidersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProvidersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Providers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Provider>>> GetProviders()
        {
            return await _context.Providers
                .Include(p => p.Licenses)
                .ToListAsync();
        }

        // 5a. REQUIRED SCENARIO: Active providers and their active licenses
        [HttpGet("reports/active-with-active-licenses")]
        public async Task<ActionResult<IEnumerable<Provider>>> GetActiveProvidersWithActiveLicenses()
        {
            return await _context.Providers
                .Include(p => p.Licenses.Where(l => l.LicenseStatus == "Active" && l.ExpirationDate > DateTime.UtcNow))
                .Where(p => p.Status == "Active" && p.Licenses.Any(l => l.LicenseStatus == "Active" && l.ExpirationDate > DateTime.UtcNow))
                .ToListAsync();
        }

        // 5b. REQUIRED SCENARIO: Providers appearing active but having expired licenses
        [HttpGet("reports/active-with-expired-licenses")]
        public async Task<ActionResult<IEnumerable<Provider>>> GetActiveProvidersWithExpiredLicenses()
        {
            return await _context.Providers
                .Include(p => p.Licenses.Where(l => l.ExpirationDate <= DateTime.UtcNow || l.LicenseStatus == "Expired"))
                .Where(p => p.Status == "Active" && p.Licenses.Any(l => l.ExpirationDate <= DateTime.UtcNow || l.LicenseStatus == "Expired"))
                .ToListAsync();
        }

        // 5c. REQUIRED SCENARIO: View soft-deleted audit records (Bypasses global filter)
        [HttpGet("audit/deleted-providers")]
        public async Task<ActionResult<IEnumerable<Provider>>> GetDeletedProviders()
        {
            return await _context.Providers
                .IgnoreQueryFilters()
                .Where(p => p.IsDeleted)
                .Include(p => p.Licenses)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Provider>> GetProvider(int id)
        {
            var provider = await _context.Providers
                .Include(p => p.Licenses)
                .FirstOrDefaultAsync(p => p.ProviderId == id);

            if (provider == null) return NotFound();

            return provider;
        }

        // 2. CREATE PROVIDER
        [HttpPost]
        public async Task<ActionResult<Provider>> PostProvider(Provider provider)
        {
            _context.Providers.Add(provider);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProvider), new { id = provider.ProviderId }, provider);
        }

        // 3. EDIT PROVIDER
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProvider(int id, Provider provider)
        {
            if (id != provider.ProviderId) return BadRequest();

            _context.Entry(provider).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProviderExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // 4. DELETE PROVIDER (Soft Delete Enforced in DbContext)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProvider(int id)
        {
            var provider = await _context.Providers.FindAsync(id);
            if (provider == null) return NotFound();

            // Calling Remove triggers our SaveChangesAsync override, turning it into a soft delete
            _context.Providers.Remove(provider);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProviderExists(int id)
        {
            return _context.Providers.Any(e => e.ProviderId == id);
        }
    }
}