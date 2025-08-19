export interface Post {
    _id: string;
    title: string;
    description?: string;
    images?: string[];
    latitude?: number;
    longitude?: number;
    state: string;
    weightedSeverity?: number;
    user: { _id: string; name: string };
    comments: Comment[];
    lowCount: number;
    mediumCount: number;
    highCount: number;
    criticalCount: number;
    solution: Solution[];
    post_date: string;
    votes: Vote[];
    currentUserVoted: true | false;
    currentVoteType: number;
    pincode: string;
}

export interface Solution {
    description: string;
    _id: string;
    img: string[];
}

export interface Comment {
    _id: string;
    comment: string;
    upvotes: number;
    downvotes: number;
    written_by: string;
}

export interface Vote {
    userId: string;
    voteType: number;
}
