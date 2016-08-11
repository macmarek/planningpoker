using System;
using System.Collections.Generic;
using System.Linq;
using PlanningPoker.Services.Helpers;
using PlanningPoker.Services.Model;

namespace PlanningPoker.Services.Dao
{
    public static class StaticSessionsDao
    {
        private static List<Session> all;

        static StaticSessionsDao()
        {
            all = new List<Session>();
        }

        public static IEnumerable<Session> GetAll()
        {
            return all;
        }

        public static Session Create()
        {
            var session = new Session
            {
                Id = Guid.NewGuid(),
                ExpireTimeUtc = DateTime.UtcNow.AddHours(1),
                ShortId = RandomIdGenerator.GetBase62(8),
                Members = new List<TeamMember>()
            };
            all.Add(session);

            return session;
        }

        public static Session GetByShortId(string id)
        {
            var ret = all.FirstOrDefault(x => x.ShortId == id);
            return ret;
        }

        public static TeamMember AddMember(string shortId, string name)
        {
            var session = GetByShortId(shortId);

            var member = new TeamMember
            {
                Id = Guid.NewGuid(),
                Name = name
            };

            if (session.Members.Count == 0)
            {
                member.IsAdmin = true;
            }

            session.Members.Add(member);

            return member;
        }

        public static void RemoveMember(string shortId, Guid memberId)
        {
            var session = all.First(x => x.ShortId == shortId);
            var member = session.Members.Single(x => x.Id == memberId);
            session.Members.Remove(member);
        }

        public static void Vote(string shortId, Guid memberId, string vote)
        {
            var session = all.First(x => x.ShortId == shortId);
            var member = session.Members.Single(x => x.Id == memberId);
            member.Vote = vote;

        }

        public static void StartVoting(string shortId, Guid memberId)
        {
            var session = all.First(x => x.ShortId == shortId);
            var callingMamber = GetMemberById(session, memberId);
            if (!callingMamber.IsAdmin)
            {
                throw new ArgumentException("non admin can't start voting");
            }

            foreach (var member in session.Members)
            {
                member.Vote = null;
            }
            session.IsVoting = true;
        }

        public static void StopVoting(string shortId, Guid memberId)
        {
            var session = all.First(x => x.ShortId == shortId);
            var callingMamber = GetMemberById(session, memberId);
            if (!callingMamber.IsAdmin)
            {
                throw new ArgumentException("non admin can't stop voting");
            }
            session.IsVoting = false;
        }

        private static TeamMember GetMemberById(Session session, Guid memberId)
        {
            return session.Members.First(x => x.Id == memberId);
        }

        public static void RemoveExpiredSessions()
        {
            var now = DateTime.UtcNow;
            foreach (var session in all)
            {
                if (session.ExpireTimeUtc < now)
                {
                    all.Remove(session);
                }
            }
        }
    }
}

