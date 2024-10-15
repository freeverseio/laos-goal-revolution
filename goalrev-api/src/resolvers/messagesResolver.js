const dayjs = require('dayjs');

const getMessagesResolver = async (context, { teamId, auctionId, limit, offset }) => {
  try {        
    const { pgClient } = context;
    limit = parseInt(limit) ? parseInt(limit) : null;
    offset = parseInt(offset) ? parseInt(offset) : 0;
    const mailboxStartedAt = await selectTeamMailboxStartedAt(pgClient, { teamId });
    const isDateValid = dayjs(mailboxStartedAt).isValid();
    const createdAt = isDateValid ? mailboxStartedAt : dayjs('2020-06-01T16:00:00.000Z').format();

    const messages = await selectMessages(pgClient, {
      destinatary: teamId,
      auctionId,
      createdAt,
      offset,
      limit,
    });
    return { totalCount: messages.length, nodes: messages.map(messagesView) };
  } catch (e) {
    return e;
  }
};

const selectTeamMailboxStartedAt = async (pgClient, { teamId }) => {
  const values = [teamId];

  try {
    const selectTeamMailboxStartedAtQuery = {
      name: 'team-mailbox-started-at-by-team-id',
      text: `
        SELECT
          mailbox_started_at
        FROM
          team_props
        WHERE
          team_id = $1
      `,
    };
    const { rows } = await pgClient.query(selectTeamMailboxStartedAtQuery, values);
    if (rows[0] && rows[0].mailbox_started_at) {
      const { mailbox_started_at } = rows[0];
      return mailbox_started_at;
    }

    return '';
  } catch (e) {
    throw e;
  }
};

const selectMessages = async (pgClient, { destinatary, auctionId, createdAt, offset, limit }) => {
  const values = auctionId
    ? [destinatary, createdAt, limit, offset, auctionId]
    : [destinatary, createdAt, limit, offset];

  try {
    const selectMessagesQuery = ({ auctionId }) => {
      return {
        text: `
        SELECT
          id,
          destinatary,
          category,
          auction_id,
          title,
          text_message as text,
          custom_image_url,
          metadata::TEXT,
          is_read,
          created_at
        FROM
          inbox
        WHERE
          destinatary = $1
          AND created_at >= $2
          ${auctionId ? 'AND auction_id = $5' : ''}
          ORDER BY created_at DESC
        LIMIT $3
        OFFSET $4
      `,
      };
    };

    const { rows } = await pgClient.query(selectMessagesQuery({ auctionId }), values);
    return rows;
  } catch (e) {
    throw e;
  }
};

const messagesView = ({
  id,
  destinatary,
  category,
  auction_id,
  title,
  text,
  custom_image_url,
  metadata,
  is_read,
  created_at,
}) => {
  return {
    id,
    destinatary,
    category,
    auctionId: auction_id,
    title,
    text,
    customImageUrl: custom_image_url,
    metadata,
    isRead: is_read,
    createdAt: dayjs(created_at).format(),
  };
};

const selectNumUnreadMessages = async (context, { destinatary, createdAt }) => {
  const { pgClient } = context;
  const values = [destinatary, createdAt];
  try {
    const selectNumUnreadMessagesQuery = {
      text: `
        SELECT
          count(id) as num
        FROM
          inbox
        WHERE
          destinatary = $1
          AND is_read = false
          AND created_at >= $2
      `,
    };
    const { rows } = await pgClient.query(selectNumUnreadMessagesQuery, values);
    return rows[0];
  } catch (e) {
    throw e;
  }
};

const getNumUnreadMessagesResolver = async (context, { teamId }) => {
  try {
    const { pgClient } = context;
    const mailboxStartedAt = await selectTeamMailboxStartedAt(pgClient, { teamId });
    const isDateValid = dayjs(mailboxStartedAt).isValid();
    const createdAt = isDateValid ? mailboxStartedAt : dayjs('2020-06-01T16:00:00.000Z').format();
    const { num: numUnreadMessages } = await selectNumUnreadMessages(context, { destinatary: teamId, createdAt });
    return parseInt(numUnreadMessages);
  } catch (e) {
    return e;
  }
};

module.exports = {
  getMessagesResolver,
  getNumUnreadMessagesResolver,
};
