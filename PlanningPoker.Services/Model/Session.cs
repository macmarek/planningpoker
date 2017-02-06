using System;
using System.Collections.Generic;

namespace PlanningPoker.Services.Model
{
    public class Session
    {
        public Guid Id { get; set; }
        public string ShortId { get; set; }
        public DateTime ExpireTimeUtc { get; set; }
        public bool IsVoting { get; set; }
        public string Title { get; set; }
        public bool UseVotingButtons { get; set; }

        public List<TeamMember> Members { get; set; }
    }
}
