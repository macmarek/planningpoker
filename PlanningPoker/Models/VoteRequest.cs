using System;

namespace PlanningPoker.Models
{
    public class VoteRequest
    {
        public string ShortId { get; set; }
        public Guid MemberId { get; set; }
        public string Vote { get; set; }
    }
}