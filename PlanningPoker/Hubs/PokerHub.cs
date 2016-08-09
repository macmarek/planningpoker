using System;
using Microsoft.AspNet.SignalR;
using PlanningPoker.Services.Dao;

namespace PlanningPoker.Hubs
{
    public class PokerHub : Hub
    {
        public void RefreshMemberList(string shortId)
        {
            var session = StaticSessionsDao.GetByShortId(shortId);
            Clients.All.refreshMemberListCallback(session);
        }

        public void MemberVoted(Guid memberId)
        {
            Clients.All.memberVotedCallback(memberId);
        }

        public void VotingStarted(string shortId)
        {
            var session = StaticSessionsDao.GetByShortId(shortId);
            Clients.All.votingStartedCallback(session);
        }

        public void VotingStopped(string shortId)
        {
            Clients.All.votingStopped(shortId);
        }
    }
}