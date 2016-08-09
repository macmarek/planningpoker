using System.Web.Mvc;
using PlanningPoker.Models;
using PlanningPoker.Services.Dao;

namespace PlanningPoker.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Chat()
        {
            return View();
        }
    }
}