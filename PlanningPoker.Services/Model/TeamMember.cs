﻿using System;

namespace PlanningPoker.Services.Model
{
    public class TeamMember
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Vote { get; set; }
        public bool IsAdmin { get; set; }
    }
}
