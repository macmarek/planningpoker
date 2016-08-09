using PlanningPoker.Services.Dao;
using PlanningPoker.Services.Model;

namespace PlanningPoker.Services
{
    public class SessionService
    {
        public Session Create()
        {
            return StaticSessionsDao.Create();
        }
    }
}
