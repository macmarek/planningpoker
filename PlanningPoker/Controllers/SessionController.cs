using System.Web.Mvc;
using Newtonsoft.Json;
using PlanningPoker.Services.Dao;

namespace PlanningPoker.Controllers
{
    public class SessionController : Controller
    {
        public ActionResult SessionByShortId(string shortId)
        {
            var session = StaticSessionsDao.GetByShortId(shortId);

            if (session == null)
            {
                return View("SessionNotFound");
            }

            ViewBag.SessionJson = JsonConvert.SerializeObject(session);

            return View();
        }
    }
}