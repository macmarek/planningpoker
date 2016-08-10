using System;

namespace PlanningPoker.Models
{
    public class ToggleSessionVotingRequest
    {
        public string ShortId { get; set; }
        public bool IsVoting { get; set; }
        public Guid MemberId { get; set; }
    }
}