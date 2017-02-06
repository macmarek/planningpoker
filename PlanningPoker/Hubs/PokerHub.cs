using System;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using PlanningPoker.Services.Dao;

namespace PlanningPoker.Hubs
{
    public class PokerHub : Hub
    {
        public async Task JoinGroup(string shortId)
        {
            await Groups.Add(Context.ConnectionId, shortId);
            var session = StaticSessionsDao.GetByShortId(shortId);
            Clients.Caller.addedToGoupCallback(session);
        }

        public async Task LeaveGroup(string shortId)
        {
            await Groups.Remove(Context.ConnectionId, shortId);
            var session = StaticSessionsDao.GetByShortId(shortId);
            Clients.Group(shortId).refreshMemberListCallback(session);
        }

        public void RefreshMemberList(string shortId)
        {
            var session = StaticSessionsDao.GetByShortId(shortId);
            Clients.Group(shortId).refreshMemberListCallback(session);
        }

        public void MemberVoted(Guid memberId, string shortId)
        {
            Clients.Group(shortId).memberVotedCallback(memberId);
        }

        public void VotingStarted(string shortId)
        {
            var session = StaticSessionsDao.GetByShortId(shortId);
            Clients.Group(shortId).votingStartedCallback(session);
        }

        public void VotingStopped(string shortId)
        {
            Clients.Group(shortId).votingStoppedCallback(shortId);
        }

        public void ChangeTitle(Guid memberId, string shortId, string title)
        {
            StaticSessionsDao.ChangeTitle(memberId, shortId, title);
            Clients.Group(shortId).changedTitleCallback(title);
        }

        public void ChangeUseVotingButtons(Guid memberId, string shortId, bool value)
        {
            StaticSessionsDao.ChangeUseVotingButtons(memberId, shortId, value);
            Clients.Group(shortId).changedUseVotingButtonsCallback(value);
        }
    }
}