
comment on table auctions is E'@omit create,update,delete';
comment on table auctions_histories is E'@omit create,update,delete';
comment on table bids is E'@omit create,update,delete';
comment on table bids_histories is E'@omit create,update,delete';
comment on table inbox is E'@omit create,update,delete';
comment on table offers is E'@omit create,update,delete';
comment on table offers_histories is E'@omit create,update,delete';
comment on table playstore_orders is E'@omit create,update,delete';
comment on table playstore_orders_histories is E'@omit create,update,delete';
comment on table shop_items is E'@omit create,update,delete';
comment on table tactics_histories is E'@omit create,update,delete';
comment on table trainings_histories is E'@omit create,update,delete';
comment on table team_props_histories is E'@omit create,update,delete'
comment on table last_transfer is E'@omit create,update,delete';
comment on function recalculate_leaderboard_position(p_timezone_idx INT, p_country_idx INT, p_league_idx INT) is E'@omit execute';