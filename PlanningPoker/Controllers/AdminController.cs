using System.Linq;
using System.Web.Mvc;
using PlanningPoker.Helpers;
using PlanningPoker.Services.Dao;

namespace PlanningPoker.Controllers
{
    [CustomAuthorize]
    public class AdminController: Controller
    {
        public ActionResult Index()
        {
            var all = StaticSessionsDao.GetAll().OrderByDescending(x=>x.ExpireTimeUtc).Take(100);

            return View(all);
        }

        public JsonResult ExpireSessions()
        {
            StaticSessionsDao.RemoveExpiredSessions();

            return Json("ok", JsonRequestBehavior.AllowGet);
        }
    }
}