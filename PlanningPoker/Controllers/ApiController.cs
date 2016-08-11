using System.Web.Mvc;
using PlanningPoker.Hubs;
using PlanningPoker.Models;
using PlanningPoker.Services.Dao;

namespace PlanningPoker.Controllers
{
    public class ApiController : Controller
    { 
        [HttpPost]
        public JsonResult Create(CreateSessionRequest req)
        {
            var session = StaticSessionsDao.Create();
            return Json(session);
        }

        [HttpPost]
        public JsonResult AddMember(AddMemberRequest req)
        {
            var member = StaticSessionsDao.AddMember(req.ShortId, req.Name);
            return Json(member);
        }

        [HttpPost]
        public JsonResult RemoveMember(RemoveMemberRequest req)
        {
            StaticSessionsDao.RemoveMember(req.ShortId, req.MemberId);
            return Json("ok");
        }

        [HttpPost]
        public JsonResult Vote(VoteRequest req)
        {
            StaticSessionsDao.Vote(req.ShortId, req.MemberId, req.Vote);
            return Json("ok");
        }

        [HttpPost]
        public JsonResult StartVoting(ToggleSessionVotingRequest req)
        {
            StaticSessionsDao.StartVoting(req.ShortId, req.MemberId);
            return Json("ok");
        }

        [HttpPost]
        public JsonResult StopVoting(ToggleSessionVotingRequest req)
        {
            StaticSessionsDao.StopVoting(req.ShortId, req.MemberId);
            return Json("ok");
        }

    }
}