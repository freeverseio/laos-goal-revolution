import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from './Team';

@Entity('team_props', { schema: 'public' })
export class TeamProps {

    @PrimaryColumn({ type: 'text', name: 'team_id' })
    teamId!: string;

    @Column({ type: 'text', name: 'team_name', nullable: true })
    teamName?: string;

    @Column({ type: 'text', name: 'team_manager_name', nullable: true })
    teamManagerName?: string;

    @Column({ type: 'timestamp', name: 'mailbox_started_at', nullable: true })
    mailboxStartedAt?: Date;

    @Column({ type: 'timestamp', name: 'last_time_logged_in', nullable: true })
    lastTimeLoggedIn?: Date;

    @Column({ type: 'text', name: 'get_social_id', nullable: true })
    getSocialId?: string;

    @ManyToOne(() => Team)
    @JoinColumn({ name: 'team_id' })
    team!: Team;
}
