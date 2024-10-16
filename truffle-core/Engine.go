// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package goalrev

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// GoalrevMetaData contains all meta data concerning the Goalrev contract.
var GoalrevMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"precompAddr\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"applyBoosterAddr\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"IDX_D\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"IDX_F\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"IDX_GK\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"IDX_M\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"IDX_MD\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"IDX_MF\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"MAX_GOALS_IN_MATCH\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"MAX_RND\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"NO_SUBST\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"N_SKILLS\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"RED_CARD\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"ROUNDS_PER_MATCH\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"SK_DEF\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"SK_END\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"SK_PAS\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"SK_SHO\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"SK_SPE\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"player\",\"type\":\"uint8\"},{\"internalType\":\"uint8\",\"name\":\"pos\",\"type\":\"uint8\"}],\"name\":\"addAssister\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"player\",\"type\":\"uint8\"},{\"internalType\":\"uint8\",\"name\":\"pos\",\"type\":\"uint8\"}],\"name\":\"addForwardPos\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"player\",\"type\":\"uint8\"},{\"internalType\":\"uint8\",\"name\":\"pos\",\"type\":\"uint8\"}],\"name\":\"addHalfTimeSubs\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"nDefs\",\"type\":\"uint8\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"addNGKAndDefs\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"goals\",\"type\":\"uint8\"}],\"name\":\"addNGoals\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"nTot\",\"type\":\"uint8\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"addNTot\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"pos\",\"type\":\"uint8\"}],\"name\":\"addScoredPenalty\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"player\",\"type\":\"uint8\"},{\"internalType\":\"uint8\",\"name\":\"pos\",\"type\":\"uint8\"}],\"name\":\"addShooter\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"extraSumSkills\",\"type\":\"uint256\"}],\"name\":\"addTeamSumSkills\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"winner\",\"type\":\"uint8\"}],\"name\":\"addWinner\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[2]\",\"name\":\"logs\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint8\",\"name\":\"winner\",\"type\":\"uint8\"}],\"name\":\"addWinnerToBothLogs\",\"outputs\":[{\"internalType\":\"uint256[2]\",\"name\":\"\",\"type\":\"uint256[2]\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"player\",\"type\":\"uint8\"},{\"internalType\":\"uint8\",\"name\":\"posInHaf\",\"type\":\"uint8\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"addYellowCard\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint64\",\"name\":\"rnd\",\"type\":\"uint64\"}],\"name\":\"computeIsPenalty\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"matchLog\",\"type\":\"uint256\"},{\"internalType\":\"uint256[25]\",\"name\":\"skills\",\"type\":\"uint256[25]\"},{\"internalType\":\"uint8\",\"name\":\"nDefsInTactics\",\"type\":\"uint8\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"computeNGKAndDefs\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[2]\",\"name\":\"matchLogs\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[62]\",\"name\":\"seedAndStartTimeAndEvents\",\"type\":\"uint256[62]\"},{\"internalType\":\"uint256[25][2]\",\"name\":\"skills\",\"type\":\"uint256[25][2]\"},{\"internalType\":\"uint256[2]\",\"name\":\"tactics\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[5][2]\",\"name\":\"globSkills\",\"type\":\"uint256[5][2]\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"computeRounds\",\"outputs\":[],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint32\",\"name\":\"encoded\",\"type\":\"uint32\"}],\"name\":\"decodeBoosts\",\"outputs\":[{\"internalType\":\"uint8[6]\",\"name\":\"skillsBoost\",\"type\":\"uint8[6]\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint8[6]\",\"name\":\"skillsBoost\",\"type\":\"uint8[6]\"}],\"name\":\"encodeBoosts\",\"outputs\":[{\"internalType\":\"uint32\",\"name\":\"encoded\",\"type\":\"uint32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint8[3]\",\"name\":\"substitutions\",\"type\":\"uint8[3]\"},{\"internalType\":\"uint8[3]\",\"name\":\"subsRounds\",\"type\":\"uint8[3]\"},{\"internalType\":\"uint8[14]\",\"name\":\"lineup\",\"type\":\"uint8[14]\"},{\"internalType\":\"bool[10]\",\"name\":\"extraAttack\",\"type\":\"bool[10]\"},{\"internalType\":\"uint8\",\"name\":\"tacticsId\",\"type\":\"uint8\"}],\"name\":\"encodeTactics\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getAggressiveness\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getAlignedEndOfFirstHalf\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[25]\",\"name\":\"skills\",\"type\":\"uint256[25]\"}],\"name\":\"getBestShooter\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"bestShooter\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getBirthDay\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"}],\"name\":\"getChangesAtHalfTime\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"nChanges\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"p\",\"type\":\"uint8\"}],\"name\":\"getExtraAttack\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint8\",\"name\":\"posInLineUp\",\"type\":\"uint8\"},{\"internalType\":\"uint8[9]\",\"name\":\"playersPerZone\",\"type\":\"uint8[9]\"}],\"name\":\"getForwardPosFromPlayersPerZone\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getForwardness\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"}],\"name\":\"getFullExtraAttack\",\"outputs\":[{\"internalType\":\"bool[10]\",\"name\":\"extraAttack\",\"type\":\"bool[10]\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"}],\"name\":\"getFullLineUp\",\"outputs\":[{\"internalType\":\"uint8[14]\",\"name\":\"lineup\",\"type\":\"uint8[14]\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getGamesNonStopping\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getGeneration\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"posInHalf\",\"type\":\"uint8\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"getInGameSubsHappened\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getInjuryWeeksLeft\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getInternalPlayerId\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"}],\"name\":\"getIsCancelled\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getIsSpecial\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"}],\"name\":\"getItemsData\",\"outputs\":[{\"internalType\":\"uint8[25]\",\"name\":\"staminas\",\"type\":\"uint8[25]\"},{\"internalType\":\"uint16\",\"name\":\"\",\"type\":\"uint16\"},{\"internalType\":\"uint32\",\"name\":\"\",\"type\":\"uint32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getLeftishness\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"p\",\"type\":\"uint8\"}],\"name\":\"getLinedUp\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[25]\",\"name\":\"skills\",\"type\":\"uint256[25]\"},{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"},{\"internalType\":\"uint256\",\"name\":\"matchLog\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"seed\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"isBot\",\"type\":\"bool\"}],\"name\":\"getLinedUpSkillsAndOutOfGames\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"},{\"internalType\":\"uint256[25]\",\"name\":\"linedUpSkills\",\"type\":\"uint256[25]\"},{\"internalType\":\"uint8\",\"name\":\"err\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint8[9]\",\"name\":\"playersPerZone\",\"type\":\"uint8[9]\"}],\"name\":\"getNAttackers\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint8[9]\",\"name\":\"playersPerZone\",\"type\":\"uint8[9]\"}],\"name\":\"getNDefenders\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"}],\"name\":\"getNDefendersFromTactics\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"}],\"name\":\"getNGoals\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint8[9]\",\"name\":\"playersPerZone\",\"type\":\"uint8[9]\"}],\"name\":\"getNMidfielders\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"seed\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"nRnds\",\"type\":\"uint8\"}],\"name\":\"getNRandsFromSeed\",\"outputs\":[{\"internalType\":\"uint64[]\",\"name\":\"\",\"type\":\"uint64[]\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[2]\",\"name\":\"matchLogs\",\"type\":\"uint256[2]\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"getOutOfGameData\",\"outputs\":[{\"internalType\":\"uint256[3][2]\",\"name\":\"outOfGameData\",\"type\":\"uint256[3][2]\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getOutOfGameFirstHalf\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"getOutOfGamePlayer\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"getOutOfGameRound\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"getOutOfGameType\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getPlayerIdFromSkills\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"}],\"name\":\"getPlayersPerZone\",\"outputs\":[{\"internalType\":\"uint8[9]\",\"name\":\"\",\"type\":\"uint8[9]\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getPotential\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getRedCardLastGame\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bool\",\"name\":\"isPen\",\"type\":\"bool\"},{\"internalType\":\"uint256\",\"name\":\"blockShoot\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"skillsGK\",\"type\":\"uint256\"}],\"name\":\"getRelevantGKSkill\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"skillIdx\",\"type\":\"uint8\"}],\"name\":\"getSkill\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"p\",\"type\":\"uint8\"}],\"name\":\"getSubsRound\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getSubstitutedFirstHalf\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"p\",\"type\":\"uint8\"}],\"name\":\"getSubstitution\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getSumOfSkills\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"}],\"name\":\"getTacticsId\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"posInHaf\",\"type\":\"uint8\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"getYellowCard\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"encodedSkills\",\"type\":\"uint256\"}],\"name\":\"getYellowCardFirstHalf\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"matchLog\",\"type\":\"uint256\"},{\"internalType\":\"uint256[25]\",\"name\":\"skills\",\"type\":\"uint256[25]\"},{\"internalType\":\"uint8[9]\",\"name\":\"playersPerZone\",\"type\":\"uint8[9]\"},{\"internalType\":\"bool[10]\",\"name\":\"extraAttack\",\"type\":\"bool[10]\"},{\"internalType\":\"uint256\",\"name\":\"blockShoot\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"isPenalty\",\"type\":\"bool\"},{\"internalType\":\"uint64[3]\",\"name\":\"rnds\",\"type\":\"uint64[3]\"}],\"name\":\"managesToScore\",\"outputs\":[{\"internalType\":\"uint256[4]\",\"name\":\"scoreData\",\"type\":\"uint256[4]\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[2]\",\"name\":\"matchLogs\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint8\",\"name\":\"teamThatAttacks\",\"type\":\"uint8\"},{\"internalType\":\"uint256[5][2]\",\"name\":\"globSkills\",\"type\":\"uint256[5][2]\"},{\"internalType\":\"uint256\",\"name\":\"rndNum\",\"type\":\"uint256\"}],\"name\":\"managesToShoot\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"seed\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"matchStartTime\",\"type\":\"uint256\"},{\"internalType\":\"uint256[25][2]\",\"name\":\"skills\",\"type\":\"uint256[25][2]\"},{\"internalType\":\"uint256[2]\",\"name\":\"tactics\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[2]\",\"name\":\"matchLogs\",\"type\":\"uint256[2]\"},{\"internalType\":\"bool[5]\",\"name\":\"matchBools\",\"type\":\"bool[5]\"}],\"name\":\"playHalfMatch\",\"outputs\":[{\"internalType\":\"uint256[62]\",\"name\":\"\",\"type\":\"uint256[62]\"},{\"internalType\":\"uint8\",\"name\":\"err\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[62]\",\"name\":\"seedAndStartTimeAndEvents\",\"type\":\"uint256[62]\"},{\"internalType\":\"uint256[25][2]\",\"name\":\"skills\",\"type\":\"uint256[25][2]\"},{\"internalType\":\"uint256[2]\",\"name\":\"tactics\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[2]\",\"name\":\"matchLogs\",\"type\":\"uint256[2]\"},{\"internalType\":\"bool[5]\",\"name\":\"matchBools\",\"type\":\"bool[5]\"}],\"name\":\"playMatchWithoutPenalties\",\"outputs\":[{\"internalType\":\"uint256[2]\",\"name\":\"\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint256[2]\",\"name\":\"\",\"type\":\"uint256[2]\"},{\"internalType\":\"uint8\",\"name\":\"err\",\"type\":\"uint8\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[25]\",\"name\":\"skills\",\"type\":\"uint256[25]\"},{\"internalType\":\"uint8[9]\",\"name\":\"playersPerZone\",\"type\":\"uint8[9]\"},{\"internalType\":\"bool[10]\",\"name\":\"extraAttack\",\"type\":\"bool[10]\"},{\"internalType\":\"uint8\",\"name\":\"shooter\",\"type\":\"uint8\"},{\"internalType\":\"uint256\",\"name\":\"rnd\",\"type\":\"uint256\"}],\"name\":\"selectAssister\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[25]\",\"name\":\"skills\",\"type\":\"uint256[25]\"},{\"internalType\":\"uint8[9]\",\"name\":\"playersPerZone\",\"type\":\"uint8[9]\"},{\"internalType\":\"bool[10]\",\"name\":\"extraAttack\",\"type\":\"bool[10]\"},{\"internalType\":\"uint256\",\"name\":\"rnd\",\"type\":\"uint256\"}],\"name\":\"selectShooter\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"nChanges\",\"type\":\"uint8\"}],\"name\":\"setChangesAtHalfTime\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"happenedType\",\"type\":\"uint8\"},{\"internalType\":\"uint8\",\"name\":\"posInHalf\",\"type\":\"uint8\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"setInGameSubsHappened\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"val\",\"type\":\"bool\"}],\"name\":\"setIsCancelled\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"val\",\"type\":\"bool\"}],\"name\":\"setIsHomeStadium\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"},{\"internalType\":\"uint32\",\"name\":\"val\",\"type\":\"uint32\"}],\"name\":\"setItemBoost\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"},{\"internalType\":\"uint16\",\"name\":\"val\",\"type\":\"uint16\"}],\"name\":\"setItemId\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"log\",\"type\":\"uint256\"},{\"internalType\":\"uint8\",\"name\":\"player\",\"type\":\"uint8\"},{\"internalType\":\"uint8\",\"name\":\"round\",\"type\":\"uint8\"},{\"internalType\":\"uint8\",\"name\":\"typeOfOutOfGame\",\"type\":\"uint8\"},{\"internalType\":\"bool\",\"name\":\"is2ndHalf\",\"type\":\"bool\"}],\"name\":\"setOutOfGame\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"tactics\",\"type\":\"uint256\"},{\"internalType\":\"uint8[25]\",\"name\":\"vals\",\"type\":\"uint8[25]\"}],\"name\":\"setStaminaRecovery\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[5]\",\"name\":\"skillsTeamA\",\"type\":\"uint256[5]\"},{\"internalType\":\"uint256[5]\",\"name\":\"skillsTeamB\",\"type\":\"uint256[5]\"},{\"internalType\":\"uint256[2]\",\"name\":\"matchLogs\",\"type\":\"uint256[2]\"}],\"name\":\"teamsGetTired\",\"outputs\":[{\"internalType\":\"uint256[5]\",\"name\":\"\",\"type\":\"uint256[5]\"},{\"internalType\":\"uint256[5]\",\"name\":\"\",\"type\":\"uint256[5]\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"weight0\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"weight1\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"rndNum\",\"type\":\"uint256\"}],\"name\":\"throwDice\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256[]\",\"name\":\"weights\",\"type\":\"uint256[]\"},{\"internalType\":\"uint256\",\"name\":\"rndNum\",\"type\":\"uint256\"}],\"name\":\"throwDiceArray\",\"outputs\":[{\"internalType\":\"uint8\",\"name\":\"w\",\"type\":\"uint8\"}],\"stateMutability\":\"pure\",\"type\":\"function\"}]",
}

// GoalrevABI is the input ABI used to generate the binding from.
// Deprecated: Use GoalrevMetaData.ABI instead.
var GoalrevABI = GoalrevMetaData.ABI

// Goalrev is an auto generated Go binding around an Ethereum contract.
type Goalrev struct {
	GoalrevCaller     // Read-only binding to the contract
	GoalrevTransactor // Write-only binding to the contract
	GoalrevFilterer   // Log filterer for contract events
}

// GoalrevCaller is an auto generated read-only Go binding around an Ethereum contract.
type GoalrevCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// GoalrevTransactor is an auto generated write-only Go binding around an Ethereum contract.
type GoalrevTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// GoalrevFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type GoalrevFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// GoalrevSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type GoalrevSession struct {
	Contract     *Goalrev          // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// GoalrevCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type GoalrevCallerSession struct {
	Contract *GoalrevCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts  // Call options to use throughout this session
}

// GoalrevTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type GoalrevTransactorSession struct {
	Contract     *GoalrevTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts  // Transaction auth options to use throughout this session
}

// GoalrevRaw is an auto generated low-level Go binding around an Ethereum contract.
type GoalrevRaw struct {
	Contract *Goalrev // Generic contract binding to access the raw methods on
}

// GoalrevCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type GoalrevCallerRaw struct {
	Contract *GoalrevCaller // Generic read-only contract binding to access the raw methods on
}

// GoalrevTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type GoalrevTransactorRaw struct {
	Contract *GoalrevTransactor // Generic write-only contract binding to access the raw methods on
}

// NewGoalrev creates a new instance of Goalrev, bound to a specific deployed contract.
func NewGoalrev(address common.Address, backend bind.ContractBackend) (*Goalrev, error) {
	contract, err := bindGoalrev(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Goalrev{GoalrevCaller: GoalrevCaller{contract: contract}, GoalrevTransactor: GoalrevTransactor{contract: contract}, GoalrevFilterer: GoalrevFilterer{contract: contract}}, nil
}

// NewGoalrevCaller creates a new read-only instance of Goalrev, bound to a specific deployed contract.
func NewGoalrevCaller(address common.Address, caller bind.ContractCaller) (*GoalrevCaller, error) {
	contract, err := bindGoalrev(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &GoalrevCaller{contract: contract}, nil
}

// NewGoalrevTransactor creates a new write-only instance of Goalrev, bound to a specific deployed contract.
func NewGoalrevTransactor(address common.Address, transactor bind.ContractTransactor) (*GoalrevTransactor, error) {
	contract, err := bindGoalrev(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &GoalrevTransactor{contract: contract}, nil
}

// NewGoalrevFilterer creates a new log filterer instance of Goalrev, bound to a specific deployed contract.
func NewGoalrevFilterer(address common.Address, filterer bind.ContractFilterer) (*GoalrevFilterer, error) {
	contract, err := bindGoalrev(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &GoalrevFilterer{contract: contract}, nil
}

// bindGoalrev binds a generic wrapper to an already deployed contract.
func bindGoalrev(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := GoalrevMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Goalrev *GoalrevRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Goalrev.Contract.GoalrevCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Goalrev *GoalrevRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Goalrev.Contract.GoalrevTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Goalrev *GoalrevRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Goalrev.Contract.GoalrevTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Goalrev *GoalrevCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Goalrev.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Goalrev *GoalrevTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Goalrev.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Goalrev *GoalrevTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Goalrev.Contract.contract.Transact(opts, method, params...)
}

// IDXD is a free data retrieval call binding the contract method 0x369151db.
//
// Solidity: function IDX_D() view returns(uint8)
func (_Goalrev *GoalrevCaller) IDXD(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "IDX_D")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// IDXD is a free data retrieval call binding the contract method 0x369151db.
//
// Solidity: function IDX_D() view returns(uint8)
func (_Goalrev *GoalrevSession) IDXD() (uint8, error) {
	return _Goalrev.Contract.IDXD(&_Goalrev.CallOpts)
}

// IDXD is a free data retrieval call binding the contract method 0x369151db.
//
// Solidity: function IDX_D() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) IDXD() (uint8, error) {
	return _Goalrev.Contract.IDXD(&_Goalrev.CallOpts)
}

// IDXF is a free data retrieval call binding the contract method 0xd7b63a11.
//
// Solidity: function IDX_F() view returns(uint8)
func (_Goalrev *GoalrevCaller) IDXF(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "IDX_F")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// IDXF is a free data retrieval call binding the contract method 0xd7b63a11.
//
// Solidity: function IDX_F() view returns(uint8)
func (_Goalrev *GoalrevSession) IDXF() (uint8, error) {
	return _Goalrev.Contract.IDXF(&_Goalrev.CallOpts)
}

// IDXF is a free data retrieval call binding the contract method 0xd7b63a11.
//
// Solidity: function IDX_F() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) IDXF() (uint8, error) {
	return _Goalrev.Contract.IDXF(&_Goalrev.CallOpts)
}

// IDXGK is a free data retrieval call binding the contract method 0x7420a606.
//
// Solidity: function IDX_GK() view returns(uint8)
func (_Goalrev *GoalrevCaller) IDXGK(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "IDX_GK")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// IDXGK is a free data retrieval call binding the contract method 0x7420a606.
//
// Solidity: function IDX_GK() view returns(uint8)
func (_Goalrev *GoalrevSession) IDXGK() (uint8, error) {
	return _Goalrev.Contract.IDXGK(&_Goalrev.CallOpts)
}

// IDXGK is a free data retrieval call binding the contract method 0x7420a606.
//
// Solidity: function IDX_GK() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) IDXGK() (uint8, error) {
	return _Goalrev.Contract.IDXGK(&_Goalrev.CallOpts)
}

// IDXM is a free data retrieval call binding the contract method 0x9cc62340.
//
// Solidity: function IDX_M() view returns(uint8)
func (_Goalrev *GoalrevCaller) IDXM(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "IDX_M")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// IDXM is a free data retrieval call binding the contract method 0x9cc62340.
//
// Solidity: function IDX_M() view returns(uint8)
func (_Goalrev *GoalrevSession) IDXM() (uint8, error) {
	return _Goalrev.Contract.IDXM(&_Goalrev.CallOpts)
}

// IDXM is a free data retrieval call binding the contract method 0x9cc62340.
//
// Solidity: function IDX_M() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) IDXM() (uint8, error) {
	return _Goalrev.Contract.IDXM(&_Goalrev.CallOpts)
}

// IDXMD is a free data retrieval call binding the contract method 0x003e3223.
//
// Solidity: function IDX_MD() view returns(uint8)
func (_Goalrev *GoalrevCaller) IDXMD(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "IDX_MD")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// IDXMD is a free data retrieval call binding the contract method 0x003e3223.
//
// Solidity: function IDX_MD() view returns(uint8)
func (_Goalrev *GoalrevSession) IDXMD() (uint8, error) {
	return _Goalrev.Contract.IDXMD(&_Goalrev.CallOpts)
}

// IDXMD is a free data retrieval call binding the contract method 0x003e3223.
//
// Solidity: function IDX_MD() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) IDXMD() (uint8, error) {
	return _Goalrev.Contract.IDXMD(&_Goalrev.CallOpts)
}

// IDXMF is a free data retrieval call binding the contract method 0x8f3db436.
//
// Solidity: function IDX_MF() view returns(uint8)
func (_Goalrev *GoalrevCaller) IDXMF(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "IDX_MF")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// IDXMF is a free data retrieval call binding the contract method 0x8f3db436.
//
// Solidity: function IDX_MF() view returns(uint8)
func (_Goalrev *GoalrevSession) IDXMF() (uint8, error) {
	return _Goalrev.Contract.IDXMF(&_Goalrev.CallOpts)
}

// IDXMF is a free data retrieval call binding the contract method 0x8f3db436.
//
// Solidity: function IDX_MF() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) IDXMF() (uint8, error) {
	return _Goalrev.Contract.IDXMF(&_Goalrev.CallOpts)
}

// MAXGOALSINMATCH is a free data retrieval call binding the contract method 0xaa1508ce.
//
// Solidity: function MAX_GOALS_IN_MATCH() view returns(uint8)
func (_Goalrev *GoalrevCaller) MAXGOALSINMATCH(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "MAX_GOALS_IN_MATCH")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// MAXGOALSINMATCH is a free data retrieval call binding the contract method 0xaa1508ce.
//
// Solidity: function MAX_GOALS_IN_MATCH() view returns(uint8)
func (_Goalrev *GoalrevSession) MAXGOALSINMATCH() (uint8, error) {
	return _Goalrev.Contract.MAXGOALSINMATCH(&_Goalrev.CallOpts)
}

// MAXGOALSINMATCH is a free data retrieval call binding the contract method 0xaa1508ce.
//
// Solidity: function MAX_GOALS_IN_MATCH() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) MAXGOALSINMATCH() (uint8, error) {
	return _Goalrev.Contract.MAXGOALSINMATCH(&_Goalrev.CallOpts)
}

// MAXRND is a free data retrieval call binding the contract method 0x2bdc66a0.
//
// Solidity: function MAX_RND() view returns(uint256)
func (_Goalrev *GoalrevCaller) MAXRND(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "MAX_RND")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// MAXRND is a free data retrieval call binding the contract method 0x2bdc66a0.
//
// Solidity: function MAX_RND() view returns(uint256)
func (_Goalrev *GoalrevSession) MAXRND() (*big.Int, error) {
	return _Goalrev.Contract.MAXRND(&_Goalrev.CallOpts)
}

// MAXRND is a free data retrieval call binding the contract method 0x2bdc66a0.
//
// Solidity: function MAX_RND() view returns(uint256)
func (_Goalrev *GoalrevCallerSession) MAXRND() (*big.Int, error) {
	return _Goalrev.Contract.MAXRND(&_Goalrev.CallOpts)
}

// NOSUBST is a free data retrieval call binding the contract method 0x3c233064.
//
// Solidity: function NO_SUBST() view returns(uint8)
func (_Goalrev *GoalrevCaller) NOSUBST(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "NO_SUBST")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// NOSUBST is a free data retrieval call binding the contract method 0x3c233064.
//
// Solidity: function NO_SUBST() view returns(uint8)
func (_Goalrev *GoalrevSession) NOSUBST() (uint8, error) {
	return _Goalrev.Contract.NOSUBST(&_Goalrev.CallOpts)
}

// NOSUBST is a free data retrieval call binding the contract method 0x3c233064.
//
// Solidity: function NO_SUBST() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) NOSUBST() (uint8, error) {
	return _Goalrev.Contract.NOSUBST(&_Goalrev.CallOpts)
}

// NSKILLS is a free data retrieval call binding the contract method 0x976daaac.
//
// Solidity: function N_SKILLS() view returns(uint8)
func (_Goalrev *GoalrevCaller) NSKILLS(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "N_SKILLS")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// NSKILLS is a free data retrieval call binding the contract method 0x976daaac.
//
// Solidity: function N_SKILLS() view returns(uint8)
func (_Goalrev *GoalrevSession) NSKILLS() (uint8, error) {
	return _Goalrev.Contract.NSKILLS(&_Goalrev.CallOpts)
}

// NSKILLS is a free data retrieval call binding the contract method 0x976daaac.
//
// Solidity: function N_SKILLS() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) NSKILLS() (uint8, error) {
	return _Goalrev.Contract.NSKILLS(&_Goalrev.CallOpts)
}

// REDCARD is a free data retrieval call binding the contract method 0xbd354846.
//
// Solidity: function RED_CARD() view returns(uint8)
func (_Goalrev *GoalrevCaller) REDCARD(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "RED_CARD")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// REDCARD is a free data retrieval call binding the contract method 0xbd354846.
//
// Solidity: function RED_CARD() view returns(uint8)
func (_Goalrev *GoalrevSession) REDCARD() (uint8, error) {
	return _Goalrev.Contract.REDCARD(&_Goalrev.CallOpts)
}

// REDCARD is a free data retrieval call binding the contract method 0xbd354846.
//
// Solidity: function RED_CARD() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) REDCARD() (uint8, error) {
	return _Goalrev.Contract.REDCARD(&_Goalrev.CallOpts)
}

// ROUNDSPERMATCH is a free data retrieval call binding the contract method 0x23a37a15.
//
// Solidity: function ROUNDS_PER_MATCH() view returns(uint8)
func (_Goalrev *GoalrevCaller) ROUNDSPERMATCH(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "ROUNDS_PER_MATCH")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// ROUNDSPERMATCH is a free data retrieval call binding the contract method 0x23a37a15.
//
// Solidity: function ROUNDS_PER_MATCH() view returns(uint8)
func (_Goalrev *GoalrevSession) ROUNDSPERMATCH() (uint8, error) {
	return _Goalrev.Contract.ROUNDSPERMATCH(&_Goalrev.CallOpts)
}

// ROUNDSPERMATCH is a free data retrieval call binding the contract method 0x23a37a15.
//
// Solidity: function ROUNDS_PER_MATCH() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) ROUNDSPERMATCH() (uint8, error) {
	return _Goalrev.Contract.ROUNDSPERMATCH(&_Goalrev.CallOpts)
}

// SKDEF is a free data retrieval call binding the contract method 0xe81e21bb.
//
// Solidity: function SK_DEF() view returns(uint8)
func (_Goalrev *GoalrevCaller) SKDEF(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "SK_DEF")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// SKDEF is a free data retrieval call binding the contract method 0xe81e21bb.
//
// Solidity: function SK_DEF() view returns(uint8)
func (_Goalrev *GoalrevSession) SKDEF() (uint8, error) {
	return _Goalrev.Contract.SKDEF(&_Goalrev.CallOpts)
}

// SKDEF is a free data retrieval call binding the contract method 0xe81e21bb.
//
// Solidity: function SK_DEF() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) SKDEF() (uint8, error) {
	return _Goalrev.Contract.SKDEF(&_Goalrev.CallOpts)
}

// SKEND is a free data retrieval call binding the contract method 0x1884332c.
//
// Solidity: function SK_END() view returns(uint8)
func (_Goalrev *GoalrevCaller) SKEND(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "SK_END")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// SKEND is a free data retrieval call binding the contract method 0x1884332c.
//
// Solidity: function SK_END() view returns(uint8)
func (_Goalrev *GoalrevSession) SKEND() (uint8, error) {
	return _Goalrev.Contract.SKEND(&_Goalrev.CallOpts)
}

// SKEND is a free data retrieval call binding the contract method 0x1884332c.
//
// Solidity: function SK_END() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) SKEND() (uint8, error) {
	return _Goalrev.Contract.SKEND(&_Goalrev.CallOpts)
}

// SKPAS is a free data retrieval call binding the contract method 0xab1b7c5e.
//
// Solidity: function SK_PAS() view returns(uint8)
func (_Goalrev *GoalrevCaller) SKPAS(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "SK_PAS")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// SKPAS is a free data retrieval call binding the contract method 0xab1b7c5e.
//
// Solidity: function SK_PAS() view returns(uint8)
func (_Goalrev *GoalrevSession) SKPAS() (uint8, error) {
	return _Goalrev.Contract.SKPAS(&_Goalrev.CallOpts)
}

// SKPAS is a free data retrieval call binding the contract method 0xab1b7c5e.
//
// Solidity: function SK_PAS() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) SKPAS() (uint8, error) {
	return _Goalrev.Contract.SKPAS(&_Goalrev.CallOpts)
}

// SKSHO is a free data retrieval call binding the contract method 0x40cd05fd.
//
// Solidity: function SK_SHO() view returns(uint8)
func (_Goalrev *GoalrevCaller) SKSHO(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "SK_SHO")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// SKSHO is a free data retrieval call binding the contract method 0x40cd05fd.
//
// Solidity: function SK_SHO() view returns(uint8)
func (_Goalrev *GoalrevSession) SKSHO() (uint8, error) {
	return _Goalrev.Contract.SKSHO(&_Goalrev.CallOpts)
}

// SKSHO is a free data retrieval call binding the contract method 0x40cd05fd.
//
// Solidity: function SK_SHO() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) SKSHO() (uint8, error) {
	return _Goalrev.Contract.SKSHO(&_Goalrev.CallOpts)
}

// SKSPE is a free data retrieval call binding the contract method 0xf8ef7b9e.
//
// Solidity: function SK_SPE() view returns(uint8)
func (_Goalrev *GoalrevCaller) SKSPE(opts *bind.CallOpts) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "SK_SPE")

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// SKSPE is a free data retrieval call binding the contract method 0xf8ef7b9e.
//
// Solidity: function SK_SPE() view returns(uint8)
func (_Goalrev *GoalrevSession) SKSPE() (uint8, error) {
	return _Goalrev.Contract.SKSPE(&_Goalrev.CallOpts)
}

// SKSPE is a free data retrieval call binding the contract method 0xf8ef7b9e.
//
// Solidity: function SK_SPE() view returns(uint8)
func (_Goalrev *GoalrevCallerSession) SKSPE() (uint8, error) {
	return _Goalrev.Contract.SKSPE(&_Goalrev.CallOpts)
}

// AddAssister is a free data retrieval call binding the contract method 0x5ac78b11.
//
// Solidity: function addAssister(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevCaller) AddAssister(opts *bind.CallOpts, log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addAssister", log, player, pos)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AddAssister is a free data retrieval call binding the contract method 0x5ac78b11.
//
// Solidity: function addAssister(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevSession) AddAssister(log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddAssister(&_Goalrev.CallOpts, log, player, pos)
}

// AddAssister is a free data retrieval call binding the contract method 0x5ac78b11.
//
// Solidity: function addAssister(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) AddAssister(log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddAssister(&_Goalrev.CallOpts, log, player, pos)
}

// AddForwardPos is a free data retrieval call binding the contract method 0xcbbfac66.
//
// Solidity: function addForwardPos(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevCaller) AddForwardPos(opts *bind.CallOpts, log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addForwardPos", log, player, pos)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AddForwardPos is a free data retrieval call binding the contract method 0xcbbfac66.
//
// Solidity: function addForwardPos(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevSession) AddForwardPos(log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddForwardPos(&_Goalrev.CallOpts, log, player, pos)
}

// AddForwardPos is a free data retrieval call binding the contract method 0xcbbfac66.
//
// Solidity: function addForwardPos(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) AddForwardPos(log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddForwardPos(&_Goalrev.CallOpts, log, player, pos)
}

// AddHalfTimeSubs is a free data retrieval call binding the contract method 0x76f96f42.
//
// Solidity: function addHalfTimeSubs(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevCaller) AddHalfTimeSubs(opts *bind.CallOpts, log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addHalfTimeSubs", log, player, pos)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AddHalfTimeSubs is a free data retrieval call binding the contract method 0x76f96f42.
//
// Solidity: function addHalfTimeSubs(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevSession) AddHalfTimeSubs(log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddHalfTimeSubs(&_Goalrev.CallOpts, log, player, pos)
}

// AddHalfTimeSubs is a free data retrieval call binding the contract method 0x76f96f42.
//
// Solidity: function addHalfTimeSubs(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) AddHalfTimeSubs(log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddHalfTimeSubs(&_Goalrev.CallOpts, log, player, pos)
}

// AddNGKAndDefs is a free data retrieval call binding the contract method 0xbf8bf719.
//
// Solidity: function addNGKAndDefs(uint256 log, uint8 nDefs, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCaller) AddNGKAndDefs(opts *bind.CallOpts, log *big.Int, nDefs uint8, is2ndHalf bool) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addNGKAndDefs", log, nDefs, is2ndHalf)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AddNGKAndDefs is a free data retrieval call binding the contract method 0xbf8bf719.
//
// Solidity: function addNGKAndDefs(uint256 log, uint8 nDefs, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevSession) AddNGKAndDefs(log *big.Int, nDefs uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.AddNGKAndDefs(&_Goalrev.CallOpts, log, nDefs, is2ndHalf)
}

// AddNGKAndDefs is a free data retrieval call binding the contract method 0xbf8bf719.
//
// Solidity: function addNGKAndDefs(uint256 log, uint8 nDefs, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) AddNGKAndDefs(log *big.Int, nDefs uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.AddNGKAndDefs(&_Goalrev.CallOpts, log, nDefs, is2ndHalf)
}

// AddNGoals is a free data retrieval call binding the contract method 0xf81c7a45.
//
// Solidity: function addNGoals(uint256 log, uint8 goals) pure returns(uint256)
func (_Goalrev *GoalrevCaller) AddNGoals(opts *bind.CallOpts, log *big.Int, goals uint8) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addNGoals", log, goals)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AddNGoals is a free data retrieval call binding the contract method 0xf81c7a45.
//
// Solidity: function addNGoals(uint256 log, uint8 goals) pure returns(uint256)
func (_Goalrev *GoalrevSession) AddNGoals(log *big.Int, goals uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddNGoals(&_Goalrev.CallOpts, log, goals)
}

// AddNGoals is a free data retrieval call binding the contract method 0xf81c7a45.
//
// Solidity: function addNGoals(uint256 log, uint8 goals) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) AddNGoals(log *big.Int, goals uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddNGoals(&_Goalrev.CallOpts, log, goals)
}

// AddNTot is a free data retrieval call binding the contract method 0x4c0b044a.
//
// Solidity: function addNTot(uint256 log, uint8 nTot, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCaller) AddNTot(opts *bind.CallOpts, log *big.Int, nTot uint8, is2ndHalf bool) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addNTot", log, nTot, is2ndHalf)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AddNTot is a free data retrieval call binding the contract method 0x4c0b044a.
//
// Solidity: function addNTot(uint256 log, uint8 nTot, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevSession) AddNTot(log *big.Int, nTot uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.AddNTot(&_Goalrev.CallOpts, log, nTot, is2ndHalf)
}

// AddNTot is a free data retrieval call binding the contract method 0x4c0b044a.
//
// Solidity: function addNTot(uint256 log, uint8 nTot, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) AddNTot(log *big.Int, nTot uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.AddNTot(&_Goalrev.CallOpts, log, nTot, is2ndHalf)
}

// AddScoredPenalty is a free data retrieval call binding the contract method 0x4cc3e34f.
//
// Solidity: function addScoredPenalty(uint256 log, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevCaller) AddScoredPenalty(opts *bind.CallOpts, log *big.Int, pos uint8) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addScoredPenalty", log, pos)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AddScoredPenalty is a free data retrieval call binding the contract method 0x4cc3e34f.
//
// Solidity: function addScoredPenalty(uint256 log, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevSession) AddScoredPenalty(log *big.Int, pos uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddScoredPenalty(&_Goalrev.CallOpts, log, pos)
}

// AddScoredPenalty is a free data retrieval call binding the contract method 0x4cc3e34f.
//
// Solidity: function addScoredPenalty(uint256 log, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) AddScoredPenalty(log *big.Int, pos uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddScoredPenalty(&_Goalrev.CallOpts, log, pos)
}

// AddShooter is a free data retrieval call binding the contract method 0xa7d0238a.
//
// Solidity: function addShooter(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevCaller) AddShooter(opts *bind.CallOpts, log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addShooter", log, player, pos)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AddShooter is a free data retrieval call binding the contract method 0xa7d0238a.
//
// Solidity: function addShooter(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevSession) AddShooter(log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddShooter(&_Goalrev.CallOpts, log, player, pos)
}

// AddShooter is a free data retrieval call binding the contract method 0xa7d0238a.
//
// Solidity: function addShooter(uint256 log, uint8 player, uint8 pos) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) AddShooter(log *big.Int, player uint8, pos uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddShooter(&_Goalrev.CallOpts, log, player, pos)
}

// AddTeamSumSkills is a free data retrieval call binding the contract method 0x989aa222.
//
// Solidity: function addTeamSumSkills(uint256 log, uint256 extraSumSkills) pure returns(uint256)
func (_Goalrev *GoalrevCaller) AddTeamSumSkills(opts *bind.CallOpts, log *big.Int, extraSumSkills *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addTeamSumSkills", log, extraSumSkills)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AddTeamSumSkills is a free data retrieval call binding the contract method 0x989aa222.
//
// Solidity: function addTeamSumSkills(uint256 log, uint256 extraSumSkills) pure returns(uint256)
func (_Goalrev *GoalrevSession) AddTeamSumSkills(log *big.Int, extraSumSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.AddTeamSumSkills(&_Goalrev.CallOpts, log, extraSumSkills)
}

// AddTeamSumSkills is a free data retrieval call binding the contract method 0x989aa222.
//
// Solidity: function addTeamSumSkills(uint256 log, uint256 extraSumSkills) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) AddTeamSumSkills(log *big.Int, extraSumSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.AddTeamSumSkills(&_Goalrev.CallOpts, log, extraSumSkills)
}

// AddWinner is a free data retrieval call binding the contract method 0x9f7d3b7f.
//
// Solidity: function addWinner(uint256 log, uint8 winner) pure returns(uint256)
func (_Goalrev *GoalrevCaller) AddWinner(opts *bind.CallOpts, log *big.Int, winner uint8) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addWinner", log, winner)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AddWinner is a free data retrieval call binding the contract method 0x9f7d3b7f.
//
// Solidity: function addWinner(uint256 log, uint8 winner) pure returns(uint256)
func (_Goalrev *GoalrevSession) AddWinner(log *big.Int, winner uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddWinner(&_Goalrev.CallOpts, log, winner)
}

// AddWinner is a free data retrieval call binding the contract method 0x9f7d3b7f.
//
// Solidity: function addWinner(uint256 log, uint8 winner) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) AddWinner(log *big.Int, winner uint8) (*big.Int, error) {
	return _Goalrev.Contract.AddWinner(&_Goalrev.CallOpts, log, winner)
}

// AddWinnerToBothLogs is a free data retrieval call binding the contract method 0x2eb7cfa7.
//
// Solidity: function addWinnerToBothLogs(uint256[2] logs, uint8 winner) pure returns(uint256[2])
func (_Goalrev *GoalrevCaller) AddWinnerToBothLogs(opts *bind.CallOpts, logs [2]*big.Int, winner uint8) ([2]*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addWinnerToBothLogs", logs, winner)

	if err != nil {
		return *new([2]*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new([2]*big.Int)).(*[2]*big.Int)

	return out0, err

}

// AddWinnerToBothLogs is a free data retrieval call binding the contract method 0x2eb7cfa7.
//
// Solidity: function addWinnerToBothLogs(uint256[2] logs, uint8 winner) pure returns(uint256[2])
func (_Goalrev *GoalrevSession) AddWinnerToBothLogs(logs [2]*big.Int, winner uint8) ([2]*big.Int, error) {
	return _Goalrev.Contract.AddWinnerToBothLogs(&_Goalrev.CallOpts, logs, winner)
}

// AddWinnerToBothLogs is a free data retrieval call binding the contract method 0x2eb7cfa7.
//
// Solidity: function addWinnerToBothLogs(uint256[2] logs, uint8 winner) pure returns(uint256[2])
func (_Goalrev *GoalrevCallerSession) AddWinnerToBothLogs(logs [2]*big.Int, winner uint8) ([2]*big.Int, error) {
	return _Goalrev.Contract.AddWinnerToBothLogs(&_Goalrev.CallOpts, logs, winner)
}

// AddYellowCard is a free data retrieval call binding the contract method 0x919e2762.
//
// Solidity: function addYellowCard(uint256 log, uint8 player, uint8 posInHaf, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCaller) AddYellowCard(opts *bind.CallOpts, log *big.Int, player uint8, posInHaf uint8, is2ndHalf bool) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "addYellowCard", log, player, posInHaf, is2ndHalf)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// AddYellowCard is a free data retrieval call binding the contract method 0x919e2762.
//
// Solidity: function addYellowCard(uint256 log, uint8 player, uint8 posInHaf, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevSession) AddYellowCard(log *big.Int, player uint8, posInHaf uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.AddYellowCard(&_Goalrev.CallOpts, log, player, posInHaf, is2ndHalf)
}

// AddYellowCard is a free data retrieval call binding the contract method 0x919e2762.
//
// Solidity: function addYellowCard(uint256 log, uint8 player, uint8 posInHaf, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) AddYellowCard(log *big.Int, player uint8, posInHaf uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.AddYellowCard(&_Goalrev.CallOpts, log, player, posInHaf, is2ndHalf)
}

// ComputeIsPenalty is a free data retrieval call binding the contract method 0x75886dcc.
//
// Solidity: function computeIsPenalty(uint64 rnd) pure returns(bool)
func (_Goalrev *GoalrevCaller) ComputeIsPenalty(opts *bind.CallOpts, rnd uint64) (bool, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "computeIsPenalty", rnd)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// ComputeIsPenalty is a free data retrieval call binding the contract method 0x75886dcc.
//
// Solidity: function computeIsPenalty(uint64 rnd) pure returns(bool)
func (_Goalrev *GoalrevSession) ComputeIsPenalty(rnd uint64) (bool, error) {
	return _Goalrev.Contract.ComputeIsPenalty(&_Goalrev.CallOpts, rnd)
}

// ComputeIsPenalty is a free data retrieval call binding the contract method 0x75886dcc.
//
// Solidity: function computeIsPenalty(uint64 rnd) pure returns(bool)
func (_Goalrev *GoalrevCallerSession) ComputeIsPenalty(rnd uint64) (bool, error) {
	return _Goalrev.Contract.ComputeIsPenalty(&_Goalrev.CallOpts, rnd)
}

// ComputeNGKAndDefs is a free data retrieval call binding the contract method 0xa1c3c9b1.
//
// Solidity: function computeNGKAndDefs(uint256 matchLog, uint256[25] skills, uint8 nDefsInTactics, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCaller) ComputeNGKAndDefs(opts *bind.CallOpts, matchLog *big.Int, skills [25]*big.Int, nDefsInTactics uint8, is2ndHalf bool) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "computeNGKAndDefs", matchLog, skills, nDefsInTactics, is2ndHalf)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// ComputeNGKAndDefs is a free data retrieval call binding the contract method 0xa1c3c9b1.
//
// Solidity: function computeNGKAndDefs(uint256 matchLog, uint256[25] skills, uint8 nDefsInTactics, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevSession) ComputeNGKAndDefs(matchLog *big.Int, skills [25]*big.Int, nDefsInTactics uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.ComputeNGKAndDefs(&_Goalrev.CallOpts, matchLog, skills, nDefsInTactics, is2ndHalf)
}

// ComputeNGKAndDefs is a free data retrieval call binding the contract method 0xa1c3c9b1.
//
// Solidity: function computeNGKAndDefs(uint256 matchLog, uint256[25] skills, uint8 nDefsInTactics, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) ComputeNGKAndDefs(matchLog *big.Int, skills [25]*big.Int, nDefsInTactics uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.ComputeNGKAndDefs(&_Goalrev.CallOpts, matchLog, skills, nDefsInTactics, is2ndHalf)
}

// ComputeRounds is a free data retrieval call binding the contract method 0x5762301d.
//
// Solidity: function computeRounds(uint256[2] matchLogs, uint256[62] seedAndStartTimeAndEvents, uint256[25][2] skills, uint256[2] tactics, uint256[5][2] globSkills, bool is2ndHalf) view returns()
func (_Goalrev *GoalrevCaller) ComputeRounds(opts *bind.CallOpts, matchLogs [2]*big.Int, seedAndStartTimeAndEvents [62]*big.Int, skills [2][25]*big.Int, tactics [2]*big.Int, globSkills [2][5]*big.Int, is2ndHalf bool) error {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "computeRounds", matchLogs, seedAndStartTimeAndEvents, skills, tactics, globSkills, is2ndHalf)

	if err != nil {
		return err
	}

	return err

}

// ComputeRounds is a free data retrieval call binding the contract method 0x5762301d.
//
// Solidity: function computeRounds(uint256[2] matchLogs, uint256[62] seedAndStartTimeAndEvents, uint256[25][2] skills, uint256[2] tactics, uint256[5][2] globSkills, bool is2ndHalf) view returns()
func (_Goalrev *GoalrevSession) ComputeRounds(matchLogs [2]*big.Int, seedAndStartTimeAndEvents [62]*big.Int, skills [2][25]*big.Int, tactics [2]*big.Int, globSkills [2][5]*big.Int, is2ndHalf bool) error {
	return _Goalrev.Contract.ComputeRounds(&_Goalrev.CallOpts, matchLogs, seedAndStartTimeAndEvents, skills, tactics, globSkills, is2ndHalf)
}

// ComputeRounds is a free data retrieval call binding the contract method 0x5762301d.
//
// Solidity: function computeRounds(uint256[2] matchLogs, uint256[62] seedAndStartTimeAndEvents, uint256[25][2] skills, uint256[2] tactics, uint256[5][2] globSkills, bool is2ndHalf) view returns()
func (_Goalrev *GoalrevCallerSession) ComputeRounds(matchLogs [2]*big.Int, seedAndStartTimeAndEvents [62]*big.Int, skills [2][25]*big.Int, tactics [2]*big.Int, globSkills [2][5]*big.Int, is2ndHalf bool) error {
	return _Goalrev.Contract.ComputeRounds(&_Goalrev.CallOpts, matchLogs, seedAndStartTimeAndEvents, skills, tactics, globSkills, is2ndHalf)
}

// DecodeBoosts is a free data retrieval call binding the contract method 0x638a5307.
//
// Solidity: function decodeBoosts(uint32 encoded) pure returns(uint8[6] skillsBoost)
func (_Goalrev *GoalrevCaller) DecodeBoosts(opts *bind.CallOpts, encoded uint32) ([6]uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "decodeBoosts", encoded)

	if err != nil {
		return *new([6]uint8), err
	}

	out0 := *abi.ConvertType(out[0], new([6]uint8)).(*[6]uint8)

	return out0, err

}

// DecodeBoosts is a free data retrieval call binding the contract method 0x638a5307.
//
// Solidity: function decodeBoosts(uint32 encoded) pure returns(uint8[6] skillsBoost)
func (_Goalrev *GoalrevSession) DecodeBoosts(encoded uint32) ([6]uint8, error) {
	return _Goalrev.Contract.DecodeBoosts(&_Goalrev.CallOpts, encoded)
}

// DecodeBoosts is a free data retrieval call binding the contract method 0x638a5307.
//
// Solidity: function decodeBoosts(uint32 encoded) pure returns(uint8[6] skillsBoost)
func (_Goalrev *GoalrevCallerSession) DecodeBoosts(encoded uint32) ([6]uint8, error) {
	return _Goalrev.Contract.DecodeBoosts(&_Goalrev.CallOpts, encoded)
}

// EncodeBoosts is a free data retrieval call binding the contract method 0x755bfe0d.
//
// Solidity: function encodeBoosts(uint8[6] skillsBoost) pure returns(uint32 encoded)
func (_Goalrev *GoalrevCaller) EncodeBoosts(opts *bind.CallOpts, skillsBoost [6]uint8) (uint32, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "encodeBoosts", skillsBoost)

	if err != nil {
		return *new(uint32), err
	}

	out0 := *abi.ConvertType(out[0], new(uint32)).(*uint32)

	return out0, err

}

// EncodeBoosts is a free data retrieval call binding the contract method 0x755bfe0d.
//
// Solidity: function encodeBoosts(uint8[6] skillsBoost) pure returns(uint32 encoded)
func (_Goalrev *GoalrevSession) EncodeBoosts(skillsBoost [6]uint8) (uint32, error) {
	return _Goalrev.Contract.EncodeBoosts(&_Goalrev.CallOpts, skillsBoost)
}

// EncodeBoosts is a free data retrieval call binding the contract method 0x755bfe0d.
//
// Solidity: function encodeBoosts(uint8[6] skillsBoost) pure returns(uint32 encoded)
func (_Goalrev *GoalrevCallerSession) EncodeBoosts(skillsBoost [6]uint8) (uint32, error) {
	return _Goalrev.Contract.EncodeBoosts(&_Goalrev.CallOpts, skillsBoost)
}

// EncodeTactics is a free data retrieval call binding the contract method 0x6f30b06f.
//
// Solidity: function encodeTactics(uint8[3] substitutions, uint8[3] subsRounds, uint8[14] lineup, bool[10] extraAttack, uint8 tacticsId) pure returns(uint256)
func (_Goalrev *GoalrevCaller) EncodeTactics(opts *bind.CallOpts, substitutions [3]uint8, subsRounds [3]uint8, lineup [14]uint8, extraAttack [10]bool, tacticsId uint8) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "encodeTactics", substitutions, subsRounds, lineup, extraAttack, tacticsId)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// EncodeTactics is a free data retrieval call binding the contract method 0x6f30b06f.
//
// Solidity: function encodeTactics(uint8[3] substitutions, uint8[3] subsRounds, uint8[14] lineup, bool[10] extraAttack, uint8 tacticsId) pure returns(uint256)
func (_Goalrev *GoalrevSession) EncodeTactics(substitutions [3]uint8, subsRounds [3]uint8, lineup [14]uint8, extraAttack [10]bool, tacticsId uint8) (*big.Int, error) {
	return _Goalrev.Contract.EncodeTactics(&_Goalrev.CallOpts, substitutions, subsRounds, lineup, extraAttack, tacticsId)
}

// EncodeTactics is a free data retrieval call binding the contract method 0x6f30b06f.
//
// Solidity: function encodeTactics(uint8[3] substitutions, uint8[3] subsRounds, uint8[14] lineup, bool[10] extraAttack, uint8 tacticsId) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) EncodeTactics(substitutions [3]uint8, subsRounds [3]uint8, lineup [14]uint8, extraAttack [10]bool, tacticsId uint8) (*big.Int, error) {
	return _Goalrev.Contract.EncodeTactics(&_Goalrev.CallOpts, substitutions, subsRounds, lineup, extraAttack, tacticsId)
}

// GetAggressiveness is a free data retrieval call binding the contract method 0x1fc7768f.
//
// Solidity: function getAggressiveness(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetAggressiveness(opts *bind.CallOpts, encodedSkills *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getAggressiveness", encodedSkills)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetAggressiveness is a free data retrieval call binding the contract method 0x1fc7768f.
//
// Solidity: function getAggressiveness(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetAggressiveness(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetAggressiveness(&_Goalrev.CallOpts, encodedSkills)
}

// GetAggressiveness is a free data retrieval call binding the contract method 0x1fc7768f.
//
// Solidity: function getAggressiveness(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetAggressiveness(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetAggressiveness(&_Goalrev.CallOpts, encodedSkills)
}

// GetAlignedEndOfFirstHalf is a free data retrieval call binding the contract method 0xf2c35764.
//
// Solidity: function getAlignedEndOfFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCaller) GetAlignedEndOfFirstHalf(opts *bind.CallOpts, encodedSkills *big.Int) (bool, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getAlignedEndOfFirstHalf", encodedSkills)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// GetAlignedEndOfFirstHalf is a free data retrieval call binding the contract method 0xf2c35764.
//
// Solidity: function getAlignedEndOfFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevSession) GetAlignedEndOfFirstHalf(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetAlignedEndOfFirstHalf(&_Goalrev.CallOpts, encodedSkills)
}

// GetAlignedEndOfFirstHalf is a free data retrieval call binding the contract method 0xf2c35764.
//
// Solidity: function getAlignedEndOfFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCallerSession) GetAlignedEndOfFirstHalf(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetAlignedEndOfFirstHalf(&_Goalrev.CallOpts, encodedSkills)
}

// GetBestShooter is a free data retrieval call binding the contract method 0x4d17bf61.
//
// Solidity: function getBestShooter(uint256[25] skills) pure returns(uint8 bestShooter)
func (_Goalrev *GoalrevCaller) GetBestShooter(opts *bind.CallOpts, skills [25]*big.Int) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getBestShooter", skills)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetBestShooter is a free data retrieval call binding the contract method 0x4d17bf61.
//
// Solidity: function getBestShooter(uint256[25] skills) pure returns(uint8 bestShooter)
func (_Goalrev *GoalrevSession) GetBestShooter(skills [25]*big.Int) (uint8, error) {
	return _Goalrev.Contract.GetBestShooter(&_Goalrev.CallOpts, skills)
}

// GetBestShooter is a free data retrieval call binding the contract method 0x4d17bf61.
//
// Solidity: function getBestShooter(uint256[25] skills) pure returns(uint8 bestShooter)
func (_Goalrev *GoalrevCallerSession) GetBestShooter(skills [25]*big.Int) (uint8, error) {
	return _Goalrev.Contract.GetBestShooter(&_Goalrev.CallOpts, skills)
}

// GetBirthDay is a free data retrieval call binding the contract method 0xf2dc657f.
//
// Solidity: function getBirthDay(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetBirthDay(opts *bind.CallOpts, encodedSkills *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getBirthDay", encodedSkills)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetBirthDay is a free data retrieval call binding the contract method 0xf2dc657f.
//
// Solidity: function getBirthDay(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetBirthDay(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetBirthDay(&_Goalrev.CallOpts, encodedSkills)
}

// GetBirthDay is a free data retrieval call binding the contract method 0xf2dc657f.
//
// Solidity: function getBirthDay(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetBirthDay(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetBirthDay(&_Goalrev.CallOpts, encodedSkills)
}

// GetChangesAtHalfTime is a free data retrieval call binding the contract method 0xba8dfa46.
//
// Solidity: function getChangesAtHalfTime(uint256 log) pure returns(uint8 nChanges)
func (_Goalrev *GoalrevCaller) GetChangesAtHalfTime(opts *bind.CallOpts, log *big.Int) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getChangesAtHalfTime", log)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetChangesAtHalfTime is a free data retrieval call binding the contract method 0xba8dfa46.
//
// Solidity: function getChangesAtHalfTime(uint256 log) pure returns(uint8 nChanges)
func (_Goalrev *GoalrevSession) GetChangesAtHalfTime(log *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetChangesAtHalfTime(&_Goalrev.CallOpts, log)
}

// GetChangesAtHalfTime is a free data retrieval call binding the contract method 0xba8dfa46.
//
// Solidity: function getChangesAtHalfTime(uint256 log) pure returns(uint8 nChanges)
func (_Goalrev *GoalrevCallerSession) GetChangesAtHalfTime(log *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetChangesAtHalfTime(&_Goalrev.CallOpts, log)
}

// GetExtraAttack is a free data retrieval call binding the contract method 0xe9b66454.
//
// Solidity: function getExtraAttack(uint256 tactics, uint8 p) pure returns(bool)
func (_Goalrev *GoalrevCaller) GetExtraAttack(opts *bind.CallOpts, tactics *big.Int, p uint8) (bool, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getExtraAttack", tactics, p)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// GetExtraAttack is a free data retrieval call binding the contract method 0xe9b66454.
//
// Solidity: function getExtraAttack(uint256 tactics, uint8 p) pure returns(bool)
func (_Goalrev *GoalrevSession) GetExtraAttack(tactics *big.Int, p uint8) (bool, error) {
	return _Goalrev.Contract.GetExtraAttack(&_Goalrev.CallOpts, tactics, p)
}

// GetExtraAttack is a free data retrieval call binding the contract method 0xe9b66454.
//
// Solidity: function getExtraAttack(uint256 tactics, uint8 p) pure returns(bool)
func (_Goalrev *GoalrevCallerSession) GetExtraAttack(tactics *big.Int, p uint8) (bool, error) {
	return _Goalrev.Contract.GetExtraAttack(&_Goalrev.CallOpts, tactics, p)
}

// GetForwardPosFromPlayersPerZone is a free data retrieval call binding the contract method 0xa14f9a79.
//
// Solidity: function getForwardPosFromPlayersPerZone(uint8 posInLineUp, uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetForwardPosFromPlayersPerZone(opts *bind.CallOpts, posInLineUp uint8, playersPerZone [9]uint8) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getForwardPosFromPlayersPerZone", posInLineUp, playersPerZone)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetForwardPosFromPlayersPerZone is a free data retrieval call binding the contract method 0xa14f9a79.
//
// Solidity: function getForwardPosFromPlayersPerZone(uint8 posInLineUp, uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetForwardPosFromPlayersPerZone(posInLineUp uint8, playersPerZone [9]uint8) (uint8, error) {
	return _Goalrev.Contract.GetForwardPosFromPlayersPerZone(&_Goalrev.CallOpts, posInLineUp, playersPerZone)
}

// GetForwardPosFromPlayersPerZone is a free data retrieval call binding the contract method 0xa14f9a79.
//
// Solidity: function getForwardPosFromPlayersPerZone(uint8 posInLineUp, uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetForwardPosFromPlayersPerZone(posInLineUp uint8, playersPerZone [9]uint8) (uint8, error) {
	return _Goalrev.Contract.GetForwardPosFromPlayersPerZone(&_Goalrev.CallOpts, posInLineUp, playersPerZone)
}

// GetForwardness is a free data retrieval call binding the contract method 0xc2bc41cd.
//
// Solidity: function getForwardness(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetForwardness(opts *bind.CallOpts, encodedSkills *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getForwardness", encodedSkills)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetForwardness is a free data retrieval call binding the contract method 0xc2bc41cd.
//
// Solidity: function getForwardness(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetForwardness(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetForwardness(&_Goalrev.CallOpts, encodedSkills)
}

// GetForwardness is a free data retrieval call binding the contract method 0xc2bc41cd.
//
// Solidity: function getForwardness(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetForwardness(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetForwardness(&_Goalrev.CallOpts, encodedSkills)
}

// GetFullExtraAttack is a free data retrieval call binding the contract method 0xdf1beecb.
//
// Solidity: function getFullExtraAttack(uint256 tactics) pure returns(bool[10] extraAttack)
func (_Goalrev *GoalrevCaller) GetFullExtraAttack(opts *bind.CallOpts, tactics *big.Int) ([10]bool, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getFullExtraAttack", tactics)

	if err != nil {
		return *new([10]bool), err
	}

	out0 := *abi.ConvertType(out[0], new([10]bool)).(*[10]bool)

	return out0, err

}

// GetFullExtraAttack is a free data retrieval call binding the contract method 0xdf1beecb.
//
// Solidity: function getFullExtraAttack(uint256 tactics) pure returns(bool[10] extraAttack)
func (_Goalrev *GoalrevSession) GetFullExtraAttack(tactics *big.Int) ([10]bool, error) {
	return _Goalrev.Contract.GetFullExtraAttack(&_Goalrev.CallOpts, tactics)
}

// GetFullExtraAttack is a free data retrieval call binding the contract method 0xdf1beecb.
//
// Solidity: function getFullExtraAttack(uint256 tactics) pure returns(bool[10] extraAttack)
func (_Goalrev *GoalrevCallerSession) GetFullExtraAttack(tactics *big.Int) ([10]bool, error) {
	return _Goalrev.Contract.GetFullExtraAttack(&_Goalrev.CallOpts, tactics)
}

// GetFullLineUp is a free data retrieval call binding the contract method 0x8b6f120f.
//
// Solidity: function getFullLineUp(uint256 tactics) pure returns(uint8[14] lineup)
func (_Goalrev *GoalrevCaller) GetFullLineUp(opts *bind.CallOpts, tactics *big.Int) ([14]uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getFullLineUp", tactics)

	if err != nil {
		return *new([14]uint8), err
	}

	out0 := *abi.ConvertType(out[0], new([14]uint8)).(*[14]uint8)

	return out0, err

}

// GetFullLineUp is a free data retrieval call binding the contract method 0x8b6f120f.
//
// Solidity: function getFullLineUp(uint256 tactics) pure returns(uint8[14] lineup)
func (_Goalrev *GoalrevSession) GetFullLineUp(tactics *big.Int) ([14]uint8, error) {
	return _Goalrev.Contract.GetFullLineUp(&_Goalrev.CallOpts, tactics)
}

// GetFullLineUp is a free data retrieval call binding the contract method 0x8b6f120f.
//
// Solidity: function getFullLineUp(uint256 tactics) pure returns(uint8[14] lineup)
func (_Goalrev *GoalrevCallerSession) GetFullLineUp(tactics *big.Int) ([14]uint8, error) {
	return _Goalrev.Contract.GetFullLineUp(&_Goalrev.CallOpts, tactics)
}

// GetGamesNonStopping is a free data retrieval call binding the contract method 0xe804e519.
//
// Solidity: function getGamesNonStopping(uint256 encodedSkills) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetGamesNonStopping(opts *bind.CallOpts, encodedSkills *big.Int) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getGamesNonStopping", encodedSkills)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetGamesNonStopping is a free data retrieval call binding the contract method 0xe804e519.
//
// Solidity: function getGamesNonStopping(uint256 encodedSkills) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetGamesNonStopping(encodedSkills *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetGamesNonStopping(&_Goalrev.CallOpts, encodedSkills)
}

// GetGamesNonStopping is a free data retrieval call binding the contract method 0xe804e519.
//
// Solidity: function getGamesNonStopping(uint256 encodedSkills) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetGamesNonStopping(encodedSkills *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetGamesNonStopping(&_Goalrev.CallOpts, encodedSkills)
}

// GetGeneration is a free data retrieval call binding the contract method 0x56e3df97.
//
// Solidity: function getGeneration(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetGeneration(opts *bind.CallOpts, encodedSkills *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getGeneration", encodedSkills)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetGeneration is a free data retrieval call binding the contract method 0x56e3df97.
//
// Solidity: function getGeneration(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetGeneration(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetGeneration(&_Goalrev.CallOpts, encodedSkills)
}

// GetGeneration is a free data retrieval call binding the contract method 0x56e3df97.
//
// Solidity: function getGeneration(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetGeneration(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetGeneration(&_Goalrev.CallOpts, encodedSkills)
}

// GetInGameSubsHappened is a free data retrieval call binding the contract method 0x5bdc6b58.
//
// Solidity: function getInGameSubsHappened(uint256 log, uint8 posInHalf, bool is2ndHalf) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetInGameSubsHappened(opts *bind.CallOpts, log *big.Int, posInHalf uint8, is2ndHalf bool) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getInGameSubsHappened", log, posInHalf, is2ndHalf)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetInGameSubsHappened is a free data retrieval call binding the contract method 0x5bdc6b58.
//
// Solidity: function getInGameSubsHappened(uint256 log, uint8 posInHalf, bool is2ndHalf) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetInGameSubsHappened(log *big.Int, posInHalf uint8, is2ndHalf bool) (uint8, error) {
	return _Goalrev.Contract.GetInGameSubsHappened(&_Goalrev.CallOpts, log, posInHalf, is2ndHalf)
}

// GetInGameSubsHappened is a free data retrieval call binding the contract method 0x5bdc6b58.
//
// Solidity: function getInGameSubsHappened(uint256 log, uint8 posInHalf, bool is2ndHalf) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetInGameSubsHappened(log *big.Int, posInHalf uint8, is2ndHalf bool) (uint8, error) {
	return _Goalrev.Contract.GetInGameSubsHappened(&_Goalrev.CallOpts, log, posInHalf, is2ndHalf)
}

// GetInjuryWeeksLeft is a free data retrieval call binding the contract method 0x79e76597.
//
// Solidity: function getInjuryWeeksLeft(uint256 encodedSkills) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetInjuryWeeksLeft(opts *bind.CallOpts, encodedSkills *big.Int) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getInjuryWeeksLeft", encodedSkills)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetInjuryWeeksLeft is a free data retrieval call binding the contract method 0x79e76597.
//
// Solidity: function getInjuryWeeksLeft(uint256 encodedSkills) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetInjuryWeeksLeft(encodedSkills *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetInjuryWeeksLeft(&_Goalrev.CallOpts, encodedSkills)
}

// GetInjuryWeeksLeft is a free data retrieval call binding the contract method 0x79e76597.
//
// Solidity: function getInjuryWeeksLeft(uint256 encodedSkills) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetInjuryWeeksLeft(encodedSkills *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetInjuryWeeksLeft(&_Goalrev.CallOpts, encodedSkills)
}

// GetInternalPlayerId is a free data retrieval call binding the contract method 0xd2f7967d.
//
// Solidity: function getInternalPlayerId(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetInternalPlayerId(opts *bind.CallOpts, encodedSkills *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getInternalPlayerId", encodedSkills)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetInternalPlayerId is a free data retrieval call binding the contract method 0xd2f7967d.
//
// Solidity: function getInternalPlayerId(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetInternalPlayerId(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetInternalPlayerId(&_Goalrev.CallOpts, encodedSkills)
}

// GetInternalPlayerId is a free data retrieval call binding the contract method 0xd2f7967d.
//
// Solidity: function getInternalPlayerId(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetInternalPlayerId(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetInternalPlayerId(&_Goalrev.CallOpts, encodedSkills)
}

// GetIsCancelled is a free data retrieval call binding the contract method 0x658d2da5.
//
// Solidity: function getIsCancelled(uint256 log) pure returns(bool)
func (_Goalrev *GoalrevCaller) GetIsCancelled(opts *bind.CallOpts, log *big.Int) (bool, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getIsCancelled", log)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// GetIsCancelled is a free data retrieval call binding the contract method 0x658d2da5.
//
// Solidity: function getIsCancelled(uint256 log) pure returns(bool)
func (_Goalrev *GoalrevSession) GetIsCancelled(log *big.Int) (bool, error) {
	return _Goalrev.Contract.GetIsCancelled(&_Goalrev.CallOpts, log)
}

// GetIsCancelled is a free data retrieval call binding the contract method 0x658d2da5.
//
// Solidity: function getIsCancelled(uint256 log) pure returns(bool)
func (_Goalrev *GoalrevCallerSession) GetIsCancelled(log *big.Int) (bool, error) {
	return _Goalrev.Contract.GetIsCancelled(&_Goalrev.CallOpts, log)
}

// GetIsSpecial is a free data retrieval call binding the contract method 0x47524b60.
//
// Solidity: function getIsSpecial(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCaller) GetIsSpecial(opts *bind.CallOpts, encodedSkills *big.Int) (bool, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getIsSpecial", encodedSkills)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// GetIsSpecial is a free data retrieval call binding the contract method 0x47524b60.
//
// Solidity: function getIsSpecial(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevSession) GetIsSpecial(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetIsSpecial(&_Goalrev.CallOpts, encodedSkills)
}

// GetIsSpecial is a free data retrieval call binding the contract method 0x47524b60.
//
// Solidity: function getIsSpecial(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCallerSession) GetIsSpecial(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetIsSpecial(&_Goalrev.CallOpts, encodedSkills)
}

// GetItemsData is a free data retrieval call binding the contract method 0x10bca22c.
//
// Solidity: function getItemsData(uint256 tactics) pure returns(uint8[25] staminas, uint16, uint32)
func (_Goalrev *GoalrevCaller) GetItemsData(opts *bind.CallOpts, tactics *big.Int) ([25]uint8, uint16, uint32, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getItemsData", tactics)

	if err != nil {
		return *new([25]uint8), *new(uint16), *new(uint32), err
	}

	out0 := *abi.ConvertType(out[0], new([25]uint8)).(*[25]uint8)
	out1 := *abi.ConvertType(out[1], new(uint16)).(*uint16)
	out2 := *abi.ConvertType(out[2], new(uint32)).(*uint32)

	return out0, out1, out2, err

}

// GetItemsData is a free data retrieval call binding the contract method 0x10bca22c.
//
// Solidity: function getItemsData(uint256 tactics) pure returns(uint8[25] staminas, uint16, uint32)
func (_Goalrev *GoalrevSession) GetItemsData(tactics *big.Int) ([25]uint8, uint16, uint32, error) {
	return _Goalrev.Contract.GetItemsData(&_Goalrev.CallOpts, tactics)
}

// GetItemsData is a free data retrieval call binding the contract method 0x10bca22c.
//
// Solidity: function getItemsData(uint256 tactics) pure returns(uint8[25] staminas, uint16, uint32)
func (_Goalrev *GoalrevCallerSession) GetItemsData(tactics *big.Int) ([25]uint8, uint16, uint32, error) {
	return _Goalrev.Contract.GetItemsData(&_Goalrev.CallOpts, tactics)
}

// GetLeftishness is a free data retrieval call binding the contract method 0x3518dd1d.
//
// Solidity: function getLeftishness(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetLeftishness(opts *bind.CallOpts, encodedSkills *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getLeftishness", encodedSkills)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetLeftishness is a free data retrieval call binding the contract method 0x3518dd1d.
//
// Solidity: function getLeftishness(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetLeftishness(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetLeftishness(&_Goalrev.CallOpts, encodedSkills)
}

// GetLeftishness is a free data retrieval call binding the contract method 0x3518dd1d.
//
// Solidity: function getLeftishness(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetLeftishness(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetLeftishness(&_Goalrev.CallOpts, encodedSkills)
}

// GetLinedUp is a free data retrieval call binding the contract method 0x05f0bb7b.
//
// Solidity: function getLinedUp(uint256 tactics, uint8 p) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetLinedUp(opts *bind.CallOpts, tactics *big.Int, p uint8) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getLinedUp", tactics, p)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetLinedUp is a free data retrieval call binding the contract method 0x05f0bb7b.
//
// Solidity: function getLinedUp(uint256 tactics, uint8 p) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetLinedUp(tactics *big.Int, p uint8) (uint8, error) {
	return _Goalrev.Contract.GetLinedUp(&_Goalrev.CallOpts, tactics, p)
}

// GetLinedUp is a free data retrieval call binding the contract method 0x05f0bb7b.
//
// Solidity: function getLinedUp(uint256 tactics, uint8 p) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetLinedUp(tactics *big.Int, p uint8) (uint8, error) {
	return _Goalrev.Contract.GetLinedUp(&_Goalrev.CallOpts, tactics, p)
}

// GetLinedUpSkillsAndOutOfGames is a free data retrieval call binding the contract method 0x8b5c3ff0.
//
// Solidity: function getLinedUpSkillsAndOutOfGames(uint256[25] skills, uint256 tactics, bool is2ndHalf, uint256 matchLog, uint256 seed, bool isBot) view returns(uint256, uint256[25] linedUpSkills, uint8 err)
func (_Goalrev *GoalrevCaller) GetLinedUpSkillsAndOutOfGames(opts *bind.CallOpts, skills [25]*big.Int, tactics *big.Int, is2ndHalf bool, matchLog *big.Int, seed *big.Int, isBot bool) (*big.Int, [25]*big.Int, uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getLinedUpSkillsAndOutOfGames", skills, tactics, is2ndHalf, matchLog, seed, isBot)

	if err != nil {
		return *new(*big.Int), *new([25]*big.Int), *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	out1 := *abi.ConvertType(out[1], new([25]*big.Int)).(*[25]*big.Int)
	out2 := *abi.ConvertType(out[2], new(uint8)).(*uint8)

	return out0, out1, out2, err

}

// GetLinedUpSkillsAndOutOfGames is a free data retrieval call binding the contract method 0x8b5c3ff0.
//
// Solidity: function getLinedUpSkillsAndOutOfGames(uint256[25] skills, uint256 tactics, bool is2ndHalf, uint256 matchLog, uint256 seed, bool isBot) view returns(uint256, uint256[25] linedUpSkills, uint8 err)
func (_Goalrev *GoalrevSession) GetLinedUpSkillsAndOutOfGames(skills [25]*big.Int, tactics *big.Int, is2ndHalf bool, matchLog *big.Int, seed *big.Int, isBot bool) (*big.Int, [25]*big.Int, uint8, error) {
	return _Goalrev.Contract.GetLinedUpSkillsAndOutOfGames(&_Goalrev.CallOpts, skills, tactics, is2ndHalf, matchLog, seed, isBot)
}

// GetLinedUpSkillsAndOutOfGames is a free data retrieval call binding the contract method 0x8b5c3ff0.
//
// Solidity: function getLinedUpSkillsAndOutOfGames(uint256[25] skills, uint256 tactics, bool is2ndHalf, uint256 matchLog, uint256 seed, bool isBot) view returns(uint256, uint256[25] linedUpSkills, uint8 err)
func (_Goalrev *GoalrevCallerSession) GetLinedUpSkillsAndOutOfGames(skills [25]*big.Int, tactics *big.Int, is2ndHalf bool, matchLog *big.Int, seed *big.Int, isBot bool) (*big.Int, [25]*big.Int, uint8, error) {
	return _Goalrev.Contract.GetLinedUpSkillsAndOutOfGames(&_Goalrev.CallOpts, skills, tactics, is2ndHalf, matchLog, seed, isBot)
}

// GetNAttackers is a free data retrieval call binding the contract method 0xf780e885.
//
// Solidity: function getNAttackers(uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetNAttackers(opts *bind.CallOpts, playersPerZone [9]uint8) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getNAttackers", playersPerZone)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetNAttackers is a free data retrieval call binding the contract method 0xf780e885.
//
// Solidity: function getNAttackers(uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetNAttackers(playersPerZone [9]uint8) (uint8, error) {
	return _Goalrev.Contract.GetNAttackers(&_Goalrev.CallOpts, playersPerZone)
}

// GetNAttackers is a free data retrieval call binding the contract method 0xf780e885.
//
// Solidity: function getNAttackers(uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetNAttackers(playersPerZone [9]uint8) (uint8, error) {
	return _Goalrev.Contract.GetNAttackers(&_Goalrev.CallOpts, playersPerZone)
}

// GetNDefenders is a free data retrieval call binding the contract method 0x573ca8f8.
//
// Solidity: function getNDefenders(uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetNDefenders(opts *bind.CallOpts, playersPerZone [9]uint8) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getNDefenders", playersPerZone)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetNDefenders is a free data retrieval call binding the contract method 0x573ca8f8.
//
// Solidity: function getNDefenders(uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetNDefenders(playersPerZone [9]uint8) (uint8, error) {
	return _Goalrev.Contract.GetNDefenders(&_Goalrev.CallOpts, playersPerZone)
}

// GetNDefenders is a free data retrieval call binding the contract method 0x573ca8f8.
//
// Solidity: function getNDefenders(uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetNDefenders(playersPerZone [9]uint8) (uint8, error) {
	return _Goalrev.Contract.GetNDefenders(&_Goalrev.CallOpts, playersPerZone)
}

// GetNDefendersFromTactics is a free data retrieval call binding the contract method 0xaf15ace3.
//
// Solidity: function getNDefendersFromTactics(uint256 tactics) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetNDefendersFromTactics(opts *bind.CallOpts, tactics *big.Int) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getNDefendersFromTactics", tactics)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetNDefendersFromTactics is a free data retrieval call binding the contract method 0xaf15ace3.
//
// Solidity: function getNDefendersFromTactics(uint256 tactics) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetNDefendersFromTactics(tactics *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetNDefendersFromTactics(&_Goalrev.CallOpts, tactics)
}

// GetNDefendersFromTactics is a free data retrieval call binding the contract method 0xaf15ace3.
//
// Solidity: function getNDefendersFromTactics(uint256 tactics) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetNDefendersFromTactics(tactics *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetNDefendersFromTactics(&_Goalrev.CallOpts, tactics)
}

// GetNGoals is a free data retrieval call binding the contract method 0x7d3921cd.
//
// Solidity: function getNGoals(uint256 log) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetNGoals(opts *bind.CallOpts, log *big.Int) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getNGoals", log)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetNGoals is a free data retrieval call binding the contract method 0x7d3921cd.
//
// Solidity: function getNGoals(uint256 log) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetNGoals(log *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetNGoals(&_Goalrev.CallOpts, log)
}

// GetNGoals is a free data retrieval call binding the contract method 0x7d3921cd.
//
// Solidity: function getNGoals(uint256 log) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetNGoals(log *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetNGoals(&_Goalrev.CallOpts, log)
}

// GetNMidfielders is a free data retrieval call binding the contract method 0xca7678fb.
//
// Solidity: function getNMidfielders(uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetNMidfielders(opts *bind.CallOpts, playersPerZone [9]uint8) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getNMidfielders", playersPerZone)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetNMidfielders is a free data retrieval call binding the contract method 0xca7678fb.
//
// Solidity: function getNMidfielders(uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetNMidfielders(playersPerZone [9]uint8) (uint8, error) {
	return _Goalrev.Contract.GetNMidfielders(&_Goalrev.CallOpts, playersPerZone)
}

// GetNMidfielders is a free data retrieval call binding the contract method 0xca7678fb.
//
// Solidity: function getNMidfielders(uint8[9] playersPerZone) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetNMidfielders(playersPerZone [9]uint8) (uint8, error) {
	return _Goalrev.Contract.GetNMidfielders(&_Goalrev.CallOpts, playersPerZone)
}

// GetNRandsFromSeed is a free data retrieval call binding the contract method 0x0b489b02.
//
// Solidity: function getNRandsFromSeed(uint256 seed, uint8 nRnds) pure returns(uint64[])
func (_Goalrev *GoalrevCaller) GetNRandsFromSeed(opts *bind.CallOpts, seed *big.Int, nRnds uint8) ([]uint64, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getNRandsFromSeed", seed, nRnds)

	if err != nil {
		return *new([]uint64), err
	}

	out0 := *abi.ConvertType(out[0], new([]uint64)).(*[]uint64)

	return out0, err

}

// GetNRandsFromSeed is a free data retrieval call binding the contract method 0x0b489b02.
//
// Solidity: function getNRandsFromSeed(uint256 seed, uint8 nRnds) pure returns(uint64[])
func (_Goalrev *GoalrevSession) GetNRandsFromSeed(seed *big.Int, nRnds uint8) ([]uint64, error) {
	return _Goalrev.Contract.GetNRandsFromSeed(&_Goalrev.CallOpts, seed, nRnds)
}

// GetNRandsFromSeed is a free data retrieval call binding the contract method 0x0b489b02.
//
// Solidity: function getNRandsFromSeed(uint256 seed, uint8 nRnds) pure returns(uint64[])
func (_Goalrev *GoalrevCallerSession) GetNRandsFromSeed(seed *big.Int, nRnds uint8) ([]uint64, error) {
	return _Goalrev.Contract.GetNRandsFromSeed(&_Goalrev.CallOpts, seed, nRnds)
}

// GetOutOfGameData is a free data retrieval call binding the contract method 0xafbdb922.
//
// Solidity: function getOutOfGameData(uint256[2] matchLogs, bool is2ndHalf) pure returns(uint256[3][2] outOfGameData)
func (_Goalrev *GoalrevCaller) GetOutOfGameData(opts *bind.CallOpts, matchLogs [2]*big.Int, is2ndHalf bool) ([2][3]*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getOutOfGameData", matchLogs, is2ndHalf)

	if err != nil {
		return *new([2][3]*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new([2][3]*big.Int)).(*[2][3]*big.Int)

	return out0, err

}

// GetOutOfGameData is a free data retrieval call binding the contract method 0xafbdb922.
//
// Solidity: function getOutOfGameData(uint256[2] matchLogs, bool is2ndHalf) pure returns(uint256[3][2] outOfGameData)
func (_Goalrev *GoalrevSession) GetOutOfGameData(matchLogs [2]*big.Int, is2ndHalf bool) ([2][3]*big.Int, error) {
	return _Goalrev.Contract.GetOutOfGameData(&_Goalrev.CallOpts, matchLogs, is2ndHalf)
}

// GetOutOfGameData is a free data retrieval call binding the contract method 0xafbdb922.
//
// Solidity: function getOutOfGameData(uint256[2] matchLogs, bool is2ndHalf) pure returns(uint256[3][2] outOfGameData)
func (_Goalrev *GoalrevCallerSession) GetOutOfGameData(matchLogs [2]*big.Int, is2ndHalf bool) ([2][3]*big.Int, error) {
	return _Goalrev.Contract.GetOutOfGameData(&_Goalrev.CallOpts, matchLogs, is2ndHalf)
}

// GetOutOfGameFirstHalf is a free data retrieval call binding the contract method 0xd1b3d8fd.
//
// Solidity: function getOutOfGameFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCaller) GetOutOfGameFirstHalf(opts *bind.CallOpts, encodedSkills *big.Int) (bool, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getOutOfGameFirstHalf", encodedSkills)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// GetOutOfGameFirstHalf is a free data retrieval call binding the contract method 0xd1b3d8fd.
//
// Solidity: function getOutOfGameFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevSession) GetOutOfGameFirstHalf(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetOutOfGameFirstHalf(&_Goalrev.CallOpts, encodedSkills)
}

// GetOutOfGameFirstHalf is a free data retrieval call binding the contract method 0xd1b3d8fd.
//
// Solidity: function getOutOfGameFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCallerSession) GetOutOfGameFirstHalf(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetOutOfGameFirstHalf(&_Goalrev.CallOpts, encodedSkills)
}

// GetOutOfGamePlayer is a free data retrieval call binding the contract method 0x2a3328f6.
//
// Solidity: function getOutOfGamePlayer(uint256 log, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetOutOfGamePlayer(opts *bind.CallOpts, log *big.Int, is2ndHalf bool) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getOutOfGamePlayer", log, is2ndHalf)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetOutOfGamePlayer is a free data retrieval call binding the contract method 0x2a3328f6.
//
// Solidity: function getOutOfGamePlayer(uint256 log, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetOutOfGamePlayer(log *big.Int, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.GetOutOfGamePlayer(&_Goalrev.CallOpts, log, is2ndHalf)
}

// GetOutOfGamePlayer is a free data retrieval call binding the contract method 0x2a3328f6.
//
// Solidity: function getOutOfGamePlayer(uint256 log, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetOutOfGamePlayer(log *big.Int, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.GetOutOfGamePlayer(&_Goalrev.CallOpts, log, is2ndHalf)
}

// GetOutOfGameRound is a free data retrieval call binding the contract method 0xd5a4d6c0.
//
// Solidity: function getOutOfGameRound(uint256 log, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetOutOfGameRound(opts *bind.CallOpts, log *big.Int, is2ndHalf bool) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getOutOfGameRound", log, is2ndHalf)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetOutOfGameRound is a free data retrieval call binding the contract method 0xd5a4d6c0.
//
// Solidity: function getOutOfGameRound(uint256 log, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetOutOfGameRound(log *big.Int, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.GetOutOfGameRound(&_Goalrev.CallOpts, log, is2ndHalf)
}

// GetOutOfGameRound is a free data retrieval call binding the contract method 0xd5a4d6c0.
//
// Solidity: function getOutOfGameRound(uint256 log, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetOutOfGameRound(log *big.Int, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.GetOutOfGameRound(&_Goalrev.CallOpts, log, is2ndHalf)
}

// GetOutOfGameType is a free data retrieval call binding the contract method 0x494dd3f4.
//
// Solidity: function getOutOfGameType(uint256 log, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetOutOfGameType(opts *bind.CallOpts, log *big.Int, is2ndHalf bool) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getOutOfGameType", log, is2ndHalf)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetOutOfGameType is a free data retrieval call binding the contract method 0x494dd3f4.
//
// Solidity: function getOutOfGameType(uint256 log, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetOutOfGameType(log *big.Int, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.GetOutOfGameType(&_Goalrev.CallOpts, log, is2ndHalf)
}

// GetOutOfGameType is a free data retrieval call binding the contract method 0x494dd3f4.
//
// Solidity: function getOutOfGameType(uint256 log, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetOutOfGameType(log *big.Int, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.GetOutOfGameType(&_Goalrev.CallOpts, log, is2ndHalf)
}

// GetPlayerIdFromSkills is a free data retrieval call binding the contract method 0x6f6c2ae0.
//
// Solidity: function getPlayerIdFromSkills(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetPlayerIdFromSkills(opts *bind.CallOpts, encodedSkills *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getPlayerIdFromSkills", encodedSkills)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetPlayerIdFromSkills is a free data retrieval call binding the contract method 0x6f6c2ae0.
//
// Solidity: function getPlayerIdFromSkills(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetPlayerIdFromSkills(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetPlayerIdFromSkills(&_Goalrev.CallOpts, encodedSkills)
}

// GetPlayerIdFromSkills is a free data retrieval call binding the contract method 0x6f6c2ae0.
//
// Solidity: function getPlayerIdFromSkills(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetPlayerIdFromSkills(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetPlayerIdFromSkills(&_Goalrev.CallOpts, encodedSkills)
}

// GetPlayersPerZone is a free data retrieval call binding the contract method 0xa12dd140.
//
// Solidity: function getPlayersPerZone(uint256 tactics) pure returns(uint8[9])
func (_Goalrev *GoalrevCaller) GetPlayersPerZone(opts *bind.CallOpts, tactics *big.Int) ([9]uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getPlayersPerZone", tactics)

	if err != nil {
		return *new([9]uint8), err
	}

	out0 := *abi.ConvertType(out[0], new([9]uint8)).(*[9]uint8)

	return out0, err

}

// GetPlayersPerZone is a free data retrieval call binding the contract method 0xa12dd140.
//
// Solidity: function getPlayersPerZone(uint256 tactics) pure returns(uint8[9])
func (_Goalrev *GoalrevSession) GetPlayersPerZone(tactics *big.Int) ([9]uint8, error) {
	return _Goalrev.Contract.GetPlayersPerZone(&_Goalrev.CallOpts, tactics)
}

// GetPlayersPerZone is a free data retrieval call binding the contract method 0xa12dd140.
//
// Solidity: function getPlayersPerZone(uint256 tactics) pure returns(uint8[9])
func (_Goalrev *GoalrevCallerSession) GetPlayersPerZone(tactics *big.Int) ([9]uint8, error) {
	return _Goalrev.Contract.GetPlayersPerZone(&_Goalrev.CallOpts, tactics)
}

// GetPotential is a free data retrieval call binding the contract method 0x434807ad.
//
// Solidity: function getPotential(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetPotential(opts *bind.CallOpts, encodedSkills *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getPotential", encodedSkills)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetPotential is a free data retrieval call binding the contract method 0x434807ad.
//
// Solidity: function getPotential(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetPotential(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetPotential(&_Goalrev.CallOpts, encodedSkills)
}

// GetPotential is a free data retrieval call binding the contract method 0x434807ad.
//
// Solidity: function getPotential(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetPotential(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetPotential(&_Goalrev.CallOpts, encodedSkills)
}

// GetRedCardLastGame is a free data retrieval call binding the contract method 0xcc7d473b.
//
// Solidity: function getRedCardLastGame(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCaller) GetRedCardLastGame(opts *bind.CallOpts, encodedSkills *big.Int) (bool, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getRedCardLastGame", encodedSkills)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// GetRedCardLastGame is a free data retrieval call binding the contract method 0xcc7d473b.
//
// Solidity: function getRedCardLastGame(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevSession) GetRedCardLastGame(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetRedCardLastGame(&_Goalrev.CallOpts, encodedSkills)
}

// GetRedCardLastGame is a free data retrieval call binding the contract method 0xcc7d473b.
//
// Solidity: function getRedCardLastGame(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCallerSession) GetRedCardLastGame(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetRedCardLastGame(&_Goalrev.CallOpts, encodedSkills)
}

// GetRelevantGKSkill is a free data retrieval call binding the contract method 0xec01f848.
//
// Solidity: function getRelevantGKSkill(bool isPen, uint256 blockShoot, uint256 skillsGK) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetRelevantGKSkill(opts *bind.CallOpts, isPen bool, blockShoot *big.Int, skillsGK *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getRelevantGKSkill", isPen, blockShoot, skillsGK)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetRelevantGKSkill is a free data retrieval call binding the contract method 0xec01f848.
//
// Solidity: function getRelevantGKSkill(bool isPen, uint256 blockShoot, uint256 skillsGK) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetRelevantGKSkill(isPen bool, blockShoot *big.Int, skillsGK *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetRelevantGKSkill(&_Goalrev.CallOpts, isPen, blockShoot, skillsGK)
}

// GetRelevantGKSkill is a free data retrieval call binding the contract method 0xec01f848.
//
// Solidity: function getRelevantGKSkill(bool isPen, uint256 blockShoot, uint256 skillsGK) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetRelevantGKSkill(isPen bool, blockShoot *big.Int, skillsGK *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetRelevantGKSkill(&_Goalrev.CallOpts, isPen, blockShoot, skillsGK)
}

// GetSkill is a free data retrieval call binding the contract method 0x29d0dcfb.
//
// Solidity: function getSkill(uint256 encodedSkills, uint8 skillIdx) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetSkill(opts *bind.CallOpts, encodedSkills *big.Int, skillIdx uint8) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getSkill", encodedSkills, skillIdx)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetSkill is a free data retrieval call binding the contract method 0x29d0dcfb.
//
// Solidity: function getSkill(uint256 encodedSkills, uint8 skillIdx) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetSkill(encodedSkills *big.Int, skillIdx uint8) (*big.Int, error) {
	return _Goalrev.Contract.GetSkill(&_Goalrev.CallOpts, encodedSkills, skillIdx)
}

// GetSkill is a free data retrieval call binding the contract method 0x29d0dcfb.
//
// Solidity: function getSkill(uint256 encodedSkills, uint8 skillIdx) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetSkill(encodedSkills *big.Int, skillIdx uint8) (*big.Int, error) {
	return _Goalrev.Contract.GetSkill(&_Goalrev.CallOpts, encodedSkills, skillIdx)
}

// GetSubsRound is a free data retrieval call binding the contract method 0x7a8409b3.
//
// Solidity: function getSubsRound(uint256 tactics, uint8 p) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetSubsRound(opts *bind.CallOpts, tactics *big.Int, p uint8) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getSubsRound", tactics, p)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetSubsRound is a free data retrieval call binding the contract method 0x7a8409b3.
//
// Solidity: function getSubsRound(uint256 tactics, uint8 p) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetSubsRound(tactics *big.Int, p uint8) (uint8, error) {
	return _Goalrev.Contract.GetSubsRound(&_Goalrev.CallOpts, tactics, p)
}

// GetSubsRound is a free data retrieval call binding the contract method 0x7a8409b3.
//
// Solidity: function getSubsRound(uint256 tactics, uint8 p) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetSubsRound(tactics *big.Int, p uint8) (uint8, error) {
	return _Goalrev.Contract.GetSubsRound(&_Goalrev.CallOpts, tactics, p)
}

// GetSubstitutedFirstHalf is a free data retrieval call binding the contract method 0xe37528bb.
//
// Solidity: function getSubstitutedFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCaller) GetSubstitutedFirstHalf(opts *bind.CallOpts, encodedSkills *big.Int) (bool, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getSubstitutedFirstHalf", encodedSkills)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// GetSubstitutedFirstHalf is a free data retrieval call binding the contract method 0xe37528bb.
//
// Solidity: function getSubstitutedFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevSession) GetSubstitutedFirstHalf(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetSubstitutedFirstHalf(&_Goalrev.CallOpts, encodedSkills)
}

// GetSubstitutedFirstHalf is a free data retrieval call binding the contract method 0xe37528bb.
//
// Solidity: function getSubstitutedFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCallerSession) GetSubstitutedFirstHalf(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetSubstitutedFirstHalf(&_Goalrev.CallOpts, encodedSkills)
}

// GetSubstitution is a free data retrieval call binding the contract method 0xe4eec4be.
//
// Solidity: function getSubstitution(uint256 tactics, uint8 p) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetSubstitution(opts *bind.CallOpts, tactics *big.Int, p uint8) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getSubstitution", tactics, p)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetSubstitution is a free data retrieval call binding the contract method 0xe4eec4be.
//
// Solidity: function getSubstitution(uint256 tactics, uint8 p) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetSubstitution(tactics *big.Int, p uint8) (uint8, error) {
	return _Goalrev.Contract.GetSubstitution(&_Goalrev.CallOpts, tactics, p)
}

// GetSubstitution is a free data retrieval call binding the contract method 0xe4eec4be.
//
// Solidity: function getSubstitution(uint256 tactics, uint8 p) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetSubstitution(tactics *big.Int, p uint8) (uint8, error) {
	return _Goalrev.Contract.GetSubstitution(&_Goalrev.CallOpts, tactics, p)
}

// GetSumOfSkills is a free data retrieval call binding the contract method 0x1060c9c2.
//
// Solidity: function getSumOfSkills(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCaller) GetSumOfSkills(opts *bind.CallOpts, encodedSkills *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getSumOfSkills", encodedSkills)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetSumOfSkills is a free data retrieval call binding the contract method 0x1060c9c2.
//
// Solidity: function getSumOfSkills(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevSession) GetSumOfSkills(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetSumOfSkills(&_Goalrev.CallOpts, encodedSkills)
}

// GetSumOfSkills is a free data retrieval call binding the contract method 0x1060c9c2.
//
// Solidity: function getSumOfSkills(uint256 encodedSkills) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) GetSumOfSkills(encodedSkills *big.Int) (*big.Int, error) {
	return _Goalrev.Contract.GetSumOfSkills(&_Goalrev.CallOpts, encodedSkills)
}

// GetTacticsId is a free data retrieval call binding the contract method 0x35515f78.
//
// Solidity: function getTacticsId(uint256 tactics) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetTacticsId(opts *bind.CallOpts, tactics *big.Int) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getTacticsId", tactics)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetTacticsId is a free data retrieval call binding the contract method 0x35515f78.
//
// Solidity: function getTacticsId(uint256 tactics) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetTacticsId(tactics *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetTacticsId(&_Goalrev.CallOpts, tactics)
}

// GetTacticsId is a free data retrieval call binding the contract method 0x35515f78.
//
// Solidity: function getTacticsId(uint256 tactics) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetTacticsId(tactics *big.Int) (uint8, error) {
	return _Goalrev.Contract.GetTacticsId(&_Goalrev.CallOpts, tactics)
}

// GetYellowCard is a free data retrieval call binding the contract method 0xb1c2c8a3.
//
// Solidity: function getYellowCard(uint256 log, uint8 posInHaf, bool is2ndHalf) pure returns(uint8)
func (_Goalrev *GoalrevCaller) GetYellowCard(opts *bind.CallOpts, log *big.Int, posInHaf uint8, is2ndHalf bool) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getYellowCard", log, posInHaf, is2ndHalf)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// GetYellowCard is a free data retrieval call binding the contract method 0xb1c2c8a3.
//
// Solidity: function getYellowCard(uint256 log, uint8 posInHaf, bool is2ndHalf) pure returns(uint8)
func (_Goalrev *GoalrevSession) GetYellowCard(log *big.Int, posInHaf uint8, is2ndHalf bool) (uint8, error) {
	return _Goalrev.Contract.GetYellowCard(&_Goalrev.CallOpts, log, posInHaf, is2ndHalf)
}

// GetYellowCard is a free data retrieval call binding the contract method 0xb1c2c8a3.
//
// Solidity: function getYellowCard(uint256 log, uint8 posInHaf, bool is2ndHalf) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) GetYellowCard(log *big.Int, posInHaf uint8, is2ndHalf bool) (uint8, error) {
	return _Goalrev.Contract.GetYellowCard(&_Goalrev.CallOpts, log, posInHaf, is2ndHalf)
}

// GetYellowCardFirstHalf is a free data retrieval call binding the contract method 0x7ffa3a2e.
//
// Solidity: function getYellowCardFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCaller) GetYellowCardFirstHalf(opts *bind.CallOpts, encodedSkills *big.Int) (bool, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "getYellowCardFirstHalf", encodedSkills)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// GetYellowCardFirstHalf is a free data retrieval call binding the contract method 0x7ffa3a2e.
//
// Solidity: function getYellowCardFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevSession) GetYellowCardFirstHalf(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetYellowCardFirstHalf(&_Goalrev.CallOpts, encodedSkills)
}

// GetYellowCardFirstHalf is a free data retrieval call binding the contract method 0x7ffa3a2e.
//
// Solidity: function getYellowCardFirstHalf(uint256 encodedSkills) pure returns(bool)
func (_Goalrev *GoalrevCallerSession) GetYellowCardFirstHalf(encodedSkills *big.Int) (bool, error) {
	return _Goalrev.Contract.GetYellowCardFirstHalf(&_Goalrev.CallOpts, encodedSkills)
}

// ManagesToScore is a free data retrieval call binding the contract method 0x4e5bb9ca.
//
// Solidity: function managesToScore(uint256 matchLog, uint256[25] skills, uint8[9] playersPerZone, bool[10] extraAttack, uint256 blockShoot, bool isPenalty, uint64[3] rnds) pure returns(uint256[4] scoreData)
func (_Goalrev *GoalrevCaller) ManagesToScore(opts *bind.CallOpts, matchLog *big.Int, skills [25]*big.Int, playersPerZone [9]uint8, extraAttack [10]bool, blockShoot *big.Int, isPenalty bool, rnds [3]uint64) ([4]*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "managesToScore", matchLog, skills, playersPerZone, extraAttack, blockShoot, isPenalty, rnds)

	if err != nil {
		return *new([4]*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new([4]*big.Int)).(*[4]*big.Int)

	return out0, err

}

// ManagesToScore is a free data retrieval call binding the contract method 0x4e5bb9ca.
//
// Solidity: function managesToScore(uint256 matchLog, uint256[25] skills, uint8[9] playersPerZone, bool[10] extraAttack, uint256 blockShoot, bool isPenalty, uint64[3] rnds) pure returns(uint256[4] scoreData)
func (_Goalrev *GoalrevSession) ManagesToScore(matchLog *big.Int, skills [25]*big.Int, playersPerZone [9]uint8, extraAttack [10]bool, blockShoot *big.Int, isPenalty bool, rnds [3]uint64) ([4]*big.Int, error) {
	return _Goalrev.Contract.ManagesToScore(&_Goalrev.CallOpts, matchLog, skills, playersPerZone, extraAttack, blockShoot, isPenalty, rnds)
}

// ManagesToScore is a free data retrieval call binding the contract method 0x4e5bb9ca.
//
// Solidity: function managesToScore(uint256 matchLog, uint256[25] skills, uint8[9] playersPerZone, bool[10] extraAttack, uint256 blockShoot, bool isPenalty, uint64[3] rnds) pure returns(uint256[4] scoreData)
func (_Goalrev *GoalrevCallerSession) ManagesToScore(matchLog *big.Int, skills [25]*big.Int, playersPerZone [9]uint8, extraAttack [10]bool, blockShoot *big.Int, isPenalty bool, rnds [3]uint64) ([4]*big.Int, error) {
	return _Goalrev.Contract.ManagesToScore(&_Goalrev.CallOpts, matchLog, skills, playersPerZone, extraAttack, blockShoot, isPenalty, rnds)
}

// ManagesToShoot is a free data retrieval call binding the contract method 0x9031ef9c.
//
// Solidity: function managesToShoot(uint256[2] matchLogs, uint8 teamThatAttacks, uint256[5][2] globSkills, uint256 rndNum) pure returns(bool)
func (_Goalrev *GoalrevCaller) ManagesToShoot(opts *bind.CallOpts, matchLogs [2]*big.Int, teamThatAttacks uint8, globSkills [2][5]*big.Int, rndNum *big.Int) (bool, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "managesToShoot", matchLogs, teamThatAttacks, globSkills, rndNum)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// ManagesToShoot is a free data retrieval call binding the contract method 0x9031ef9c.
//
// Solidity: function managesToShoot(uint256[2] matchLogs, uint8 teamThatAttacks, uint256[5][2] globSkills, uint256 rndNum) pure returns(bool)
func (_Goalrev *GoalrevSession) ManagesToShoot(matchLogs [2]*big.Int, teamThatAttacks uint8, globSkills [2][5]*big.Int, rndNum *big.Int) (bool, error) {
	return _Goalrev.Contract.ManagesToShoot(&_Goalrev.CallOpts, matchLogs, teamThatAttacks, globSkills, rndNum)
}

// ManagesToShoot is a free data retrieval call binding the contract method 0x9031ef9c.
//
// Solidity: function managesToShoot(uint256[2] matchLogs, uint8 teamThatAttacks, uint256[5][2] globSkills, uint256 rndNum) pure returns(bool)
func (_Goalrev *GoalrevCallerSession) ManagesToShoot(matchLogs [2]*big.Int, teamThatAttacks uint8, globSkills [2][5]*big.Int, rndNum *big.Int) (bool, error) {
	return _Goalrev.Contract.ManagesToShoot(&_Goalrev.CallOpts, matchLogs, teamThatAttacks, globSkills, rndNum)
}

// PlayHalfMatch is a free data retrieval call binding the contract method 0x665d00e2.
//
// Solidity: function playHalfMatch(uint256 seed, uint256 matchStartTime, uint256[25][2] skills, uint256[2] tactics, uint256[2] matchLogs, bool[5] matchBools) view returns(uint256[62], uint8 err)
func (_Goalrev *GoalrevCaller) PlayHalfMatch(opts *bind.CallOpts, seed *big.Int, matchStartTime *big.Int, skills [2][25]*big.Int, tactics [2]*big.Int, matchLogs [2]*big.Int, matchBools [5]bool) ([62]*big.Int, uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "playHalfMatch", seed, matchStartTime, skills, tactics, matchLogs, matchBools)

	if err != nil {
		return *new([62]*big.Int), *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new([62]*big.Int)).(*[62]*big.Int)
	out1 := *abi.ConvertType(out[1], new(uint8)).(*uint8)

	return out0, out1, err

}

// PlayHalfMatch is a free data retrieval call binding the contract method 0x665d00e2.
//
// Solidity: function playHalfMatch(uint256 seed, uint256 matchStartTime, uint256[25][2] skills, uint256[2] tactics, uint256[2] matchLogs, bool[5] matchBools) view returns(uint256[62], uint8 err)
func (_Goalrev *GoalrevSession) PlayHalfMatch(seed *big.Int, matchStartTime *big.Int, skills [2][25]*big.Int, tactics [2]*big.Int, matchLogs [2]*big.Int, matchBools [5]bool) ([62]*big.Int, uint8, error) {
	return _Goalrev.Contract.PlayHalfMatch(&_Goalrev.CallOpts, seed, matchStartTime, skills, tactics, matchLogs, matchBools)
}

// PlayHalfMatch is a free data retrieval call binding the contract method 0x665d00e2.
//
// Solidity: function playHalfMatch(uint256 seed, uint256 matchStartTime, uint256[25][2] skills, uint256[2] tactics, uint256[2] matchLogs, bool[5] matchBools) view returns(uint256[62], uint8 err)
func (_Goalrev *GoalrevCallerSession) PlayHalfMatch(seed *big.Int, matchStartTime *big.Int, skills [2][25]*big.Int, tactics [2]*big.Int, matchLogs [2]*big.Int, matchBools [5]bool) ([62]*big.Int, uint8, error) {
	return _Goalrev.Contract.PlayHalfMatch(&_Goalrev.CallOpts, seed, matchStartTime, skills, tactics, matchLogs, matchBools)
}

// PlayMatchWithoutPenalties is a free data retrieval call binding the contract method 0xb86d4451.
//
// Solidity: function playMatchWithoutPenalties(uint256[62] seedAndStartTimeAndEvents, uint256[25][2] skills, uint256[2] tactics, uint256[2] matchLogs, bool[5] matchBools) view returns(uint256[2], uint256[2], uint8 err)
func (_Goalrev *GoalrevCaller) PlayMatchWithoutPenalties(opts *bind.CallOpts, seedAndStartTimeAndEvents [62]*big.Int, skills [2][25]*big.Int, tactics [2]*big.Int, matchLogs [2]*big.Int, matchBools [5]bool) ([2]*big.Int, [2]*big.Int, uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "playMatchWithoutPenalties", seedAndStartTimeAndEvents, skills, tactics, matchLogs, matchBools)

	if err != nil {
		return *new([2]*big.Int), *new([2]*big.Int), *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new([2]*big.Int)).(*[2]*big.Int)
	out1 := *abi.ConvertType(out[1], new([2]*big.Int)).(*[2]*big.Int)
	out2 := *abi.ConvertType(out[2], new(uint8)).(*uint8)

	return out0, out1, out2, err

}

// PlayMatchWithoutPenalties is a free data retrieval call binding the contract method 0xb86d4451.
//
// Solidity: function playMatchWithoutPenalties(uint256[62] seedAndStartTimeAndEvents, uint256[25][2] skills, uint256[2] tactics, uint256[2] matchLogs, bool[5] matchBools) view returns(uint256[2], uint256[2], uint8 err)
func (_Goalrev *GoalrevSession) PlayMatchWithoutPenalties(seedAndStartTimeAndEvents [62]*big.Int, skills [2][25]*big.Int, tactics [2]*big.Int, matchLogs [2]*big.Int, matchBools [5]bool) ([2]*big.Int, [2]*big.Int, uint8, error) {
	return _Goalrev.Contract.PlayMatchWithoutPenalties(&_Goalrev.CallOpts, seedAndStartTimeAndEvents, skills, tactics, matchLogs, matchBools)
}

// PlayMatchWithoutPenalties is a free data retrieval call binding the contract method 0xb86d4451.
//
// Solidity: function playMatchWithoutPenalties(uint256[62] seedAndStartTimeAndEvents, uint256[25][2] skills, uint256[2] tactics, uint256[2] matchLogs, bool[5] matchBools) view returns(uint256[2], uint256[2], uint8 err)
func (_Goalrev *GoalrevCallerSession) PlayMatchWithoutPenalties(seedAndStartTimeAndEvents [62]*big.Int, skills [2][25]*big.Int, tactics [2]*big.Int, matchLogs [2]*big.Int, matchBools [5]bool) ([2]*big.Int, [2]*big.Int, uint8, error) {
	return _Goalrev.Contract.PlayMatchWithoutPenalties(&_Goalrev.CallOpts, seedAndStartTimeAndEvents, skills, tactics, matchLogs, matchBools)
}

// SelectAssister is a free data retrieval call binding the contract method 0x05db3d08.
//
// Solidity: function selectAssister(uint256[25] skills, uint8[9] playersPerZone, bool[10] extraAttack, uint8 shooter, uint256 rnd) pure returns(uint8)
func (_Goalrev *GoalrevCaller) SelectAssister(opts *bind.CallOpts, skills [25]*big.Int, playersPerZone [9]uint8, extraAttack [10]bool, shooter uint8, rnd *big.Int) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "selectAssister", skills, playersPerZone, extraAttack, shooter, rnd)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// SelectAssister is a free data retrieval call binding the contract method 0x05db3d08.
//
// Solidity: function selectAssister(uint256[25] skills, uint8[9] playersPerZone, bool[10] extraAttack, uint8 shooter, uint256 rnd) pure returns(uint8)
func (_Goalrev *GoalrevSession) SelectAssister(skills [25]*big.Int, playersPerZone [9]uint8, extraAttack [10]bool, shooter uint8, rnd *big.Int) (uint8, error) {
	return _Goalrev.Contract.SelectAssister(&_Goalrev.CallOpts, skills, playersPerZone, extraAttack, shooter, rnd)
}

// SelectAssister is a free data retrieval call binding the contract method 0x05db3d08.
//
// Solidity: function selectAssister(uint256[25] skills, uint8[9] playersPerZone, bool[10] extraAttack, uint8 shooter, uint256 rnd) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) SelectAssister(skills [25]*big.Int, playersPerZone [9]uint8, extraAttack [10]bool, shooter uint8, rnd *big.Int) (uint8, error) {
	return _Goalrev.Contract.SelectAssister(&_Goalrev.CallOpts, skills, playersPerZone, extraAttack, shooter, rnd)
}

// SelectShooter is a free data retrieval call binding the contract method 0xaff4e618.
//
// Solidity: function selectShooter(uint256[25] skills, uint8[9] playersPerZone, bool[10] extraAttack, uint256 rnd) pure returns(uint8)
func (_Goalrev *GoalrevCaller) SelectShooter(opts *bind.CallOpts, skills [25]*big.Int, playersPerZone [9]uint8, extraAttack [10]bool, rnd *big.Int) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "selectShooter", skills, playersPerZone, extraAttack, rnd)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// SelectShooter is a free data retrieval call binding the contract method 0xaff4e618.
//
// Solidity: function selectShooter(uint256[25] skills, uint8[9] playersPerZone, bool[10] extraAttack, uint256 rnd) pure returns(uint8)
func (_Goalrev *GoalrevSession) SelectShooter(skills [25]*big.Int, playersPerZone [9]uint8, extraAttack [10]bool, rnd *big.Int) (uint8, error) {
	return _Goalrev.Contract.SelectShooter(&_Goalrev.CallOpts, skills, playersPerZone, extraAttack, rnd)
}

// SelectShooter is a free data retrieval call binding the contract method 0xaff4e618.
//
// Solidity: function selectShooter(uint256[25] skills, uint8[9] playersPerZone, bool[10] extraAttack, uint256 rnd) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) SelectShooter(skills [25]*big.Int, playersPerZone [9]uint8, extraAttack [10]bool, rnd *big.Int) (uint8, error) {
	return _Goalrev.Contract.SelectShooter(&_Goalrev.CallOpts, skills, playersPerZone, extraAttack, rnd)
}

// SetChangesAtHalfTime is a free data retrieval call binding the contract method 0xc6481855.
//
// Solidity: function setChangesAtHalfTime(uint256 log, uint8 nChanges) pure returns(uint256)
func (_Goalrev *GoalrevCaller) SetChangesAtHalfTime(opts *bind.CallOpts, log *big.Int, nChanges uint8) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "setChangesAtHalfTime", log, nChanges)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// SetChangesAtHalfTime is a free data retrieval call binding the contract method 0xc6481855.
//
// Solidity: function setChangesAtHalfTime(uint256 log, uint8 nChanges) pure returns(uint256)
func (_Goalrev *GoalrevSession) SetChangesAtHalfTime(log *big.Int, nChanges uint8) (*big.Int, error) {
	return _Goalrev.Contract.SetChangesAtHalfTime(&_Goalrev.CallOpts, log, nChanges)
}

// SetChangesAtHalfTime is a free data retrieval call binding the contract method 0xc6481855.
//
// Solidity: function setChangesAtHalfTime(uint256 log, uint8 nChanges) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) SetChangesAtHalfTime(log *big.Int, nChanges uint8) (*big.Int, error) {
	return _Goalrev.Contract.SetChangesAtHalfTime(&_Goalrev.CallOpts, log, nChanges)
}

// SetInGameSubsHappened is a free data retrieval call binding the contract method 0x0ae78a39.
//
// Solidity: function setInGameSubsHappened(uint256 log, uint8 happenedType, uint8 posInHalf, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCaller) SetInGameSubsHappened(opts *bind.CallOpts, log *big.Int, happenedType uint8, posInHalf uint8, is2ndHalf bool) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "setInGameSubsHappened", log, happenedType, posInHalf, is2ndHalf)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// SetInGameSubsHappened is a free data retrieval call binding the contract method 0x0ae78a39.
//
// Solidity: function setInGameSubsHappened(uint256 log, uint8 happenedType, uint8 posInHalf, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevSession) SetInGameSubsHappened(log *big.Int, happenedType uint8, posInHalf uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.SetInGameSubsHappened(&_Goalrev.CallOpts, log, happenedType, posInHalf, is2ndHalf)
}

// SetInGameSubsHappened is a free data retrieval call binding the contract method 0x0ae78a39.
//
// Solidity: function setInGameSubsHappened(uint256 log, uint8 happenedType, uint8 posInHalf, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) SetInGameSubsHappened(log *big.Int, happenedType uint8, posInHalf uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.SetInGameSubsHappened(&_Goalrev.CallOpts, log, happenedType, posInHalf, is2ndHalf)
}

// SetIsCancelled is a free data retrieval call binding the contract method 0x0f14aef4.
//
// Solidity: function setIsCancelled(uint256 log, bool val) pure returns(uint256)
func (_Goalrev *GoalrevCaller) SetIsCancelled(opts *bind.CallOpts, log *big.Int, val bool) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "setIsCancelled", log, val)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// SetIsCancelled is a free data retrieval call binding the contract method 0x0f14aef4.
//
// Solidity: function setIsCancelled(uint256 log, bool val) pure returns(uint256)
func (_Goalrev *GoalrevSession) SetIsCancelled(log *big.Int, val bool) (*big.Int, error) {
	return _Goalrev.Contract.SetIsCancelled(&_Goalrev.CallOpts, log, val)
}

// SetIsCancelled is a free data retrieval call binding the contract method 0x0f14aef4.
//
// Solidity: function setIsCancelled(uint256 log, bool val) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) SetIsCancelled(log *big.Int, val bool) (*big.Int, error) {
	return _Goalrev.Contract.SetIsCancelled(&_Goalrev.CallOpts, log, val)
}

// SetIsHomeStadium is a free data retrieval call binding the contract method 0x185e456f.
//
// Solidity: function setIsHomeStadium(uint256 log, bool val) pure returns(uint256)
func (_Goalrev *GoalrevCaller) SetIsHomeStadium(opts *bind.CallOpts, log *big.Int, val bool) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "setIsHomeStadium", log, val)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// SetIsHomeStadium is a free data retrieval call binding the contract method 0x185e456f.
//
// Solidity: function setIsHomeStadium(uint256 log, bool val) pure returns(uint256)
func (_Goalrev *GoalrevSession) SetIsHomeStadium(log *big.Int, val bool) (*big.Int, error) {
	return _Goalrev.Contract.SetIsHomeStadium(&_Goalrev.CallOpts, log, val)
}

// SetIsHomeStadium is a free data retrieval call binding the contract method 0x185e456f.
//
// Solidity: function setIsHomeStadium(uint256 log, bool val) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) SetIsHomeStadium(log *big.Int, val bool) (*big.Int, error) {
	return _Goalrev.Contract.SetIsHomeStadium(&_Goalrev.CallOpts, log, val)
}

// SetItemBoost is a free data retrieval call binding the contract method 0xb8100e57.
//
// Solidity: function setItemBoost(uint256 tactics, uint32 val) pure returns(uint256)
func (_Goalrev *GoalrevCaller) SetItemBoost(opts *bind.CallOpts, tactics *big.Int, val uint32) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "setItemBoost", tactics, val)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// SetItemBoost is a free data retrieval call binding the contract method 0xb8100e57.
//
// Solidity: function setItemBoost(uint256 tactics, uint32 val) pure returns(uint256)
func (_Goalrev *GoalrevSession) SetItemBoost(tactics *big.Int, val uint32) (*big.Int, error) {
	return _Goalrev.Contract.SetItemBoost(&_Goalrev.CallOpts, tactics, val)
}

// SetItemBoost is a free data retrieval call binding the contract method 0xb8100e57.
//
// Solidity: function setItemBoost(uint256 tactics, uint32 val) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) SetItemBoost(tactics *big.Int, val uint32) (*big.Int, error) {
	return _Goalrev.Contract.SetItemBoost(&_Goalrev.CallOpts, tactics, val)
}

// SetItemId is a free data retrieval call binding the contract method 0x2777d02a.
//
// Solidity: function setItemId(uint256 tactics, uint16 val) pure returns(uint256)
func (_Goalrev *GoalrevCaller) SetItemId(opts *bind.CallOpts, tactics *big.Int, val uint16) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "setItemId", tactics, val)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// SetItemId is a free data retrieval call binding the contract method 0x2777d02a.
//
// Solidity: function setItemId(uint256 tactics, uint16 val) pure returns(uint256)
func (_Goalrev *GoalrevSession) SetItemId(tactics *big.Int, val uint16) (*big.Int, error) {
	return _Goalrev.Contract.SetItemId(&_Goalrev.CallOpts, tactics, val)
}

// SetItemId is a free data retrieval call binding the contract method 0x2777d02a.
//
// Solidity: function setItemId(uint256 tactics, uint16 val) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) SetItemId(tactics *big.Int, val uint16) (*big.Int, error) {
	return _Goalrev.Contract.SetItemId(&_Goalrev.CallOpts, tactics, val)
}

// SetOutOfGame is a free data retrieval call binding the contract method 0xb2a04256.
//
// Solidity: function setOutOfGame(uint256 log, uint8 player, uint8 round, uint8 typeOfOutOfGame, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCaller) SetOutOfGame(opts *bind.CallOpts, log *big.Int, player uint8, round uint8, typeOfOutOfGame uint8, is2ndHalf bool) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "setOutOfGame", log, player, round, typeOfOutOfGame, is2ndHalf)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// SetOutOfGame is a free data retrieval call binding the contract method 0xb2a04256.
//
// Solidity: function setOutOfGame(uint256 log, uint8 player, uint8 round, uint8 typeOfOutOfGame, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevSession) SetOutOfGame(log *big.Int, player uint8, round uint8, typeOfOutOfGame uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.SetOutOfGame(&_Goalrev.CallOpts, log, player, round, typeOfOutOfGame, is2ndHalf)
}

// SetOutOfGame is a free data retrieval call binding the contract method 0xb2a04256.
//
// Solidity: function setOutOfGame(uint256 log, uint8 player, uint8 round, uint8 typeOfOutOfGame, bool is2ndHalf) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) SetOutOfGame(log *big.Int, player uint8, round uint8, typeOfOutOfGame uint8, is2ndHalf bool) (*big.Int, error) {
	return _Goalrev.Contract.SetOutOfGame(&_Goalrev.CallOpts, log, player, round, typeOfOutOfGame, is2ndHalf)
}

// SetStaminaRecovery is a free data retrieval call binding the contract method 0xbe8fcecb.
//
// Solidity: function setStaminaRecovery(uint256 tactics, uint8[25] vals) pure returns(uint256)
func (_Goalrev *GoalrevCaller) SetStaminaRecovery(opts *bind.CallOpts, tactics *big.Int, vals [25]uint8) (*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "setStaminaRecovery", tactics, vals)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// SetStaminaRecovery is a free data retrieval call binding the contract method 0xbe8fcecb.
//
// Solidity: function setStaminaRecovery(uint256 tactics, uint8[25] vals) pure returns(uint256)
func (_Goalrev *GoalrevSession) SetStaminaRecovery(tactics *big.Int, vals [25]uint8) (*big.Int, error) {
	return _Goalrev.Contract.SetStaminaRecovery(&_Goalrev.CallOpts, tactics, vals)
}

// SetStaminaRecovery is a free data retrieval call binding the contract method 0xbe8fcecb.
//
// Solidity: function setStaminaRecovery(uint256 tactics, uint8[25] vals) pure returns(uint256)
func (_Goalrev *GoalrevCallerSession) SetStaminaRecovery(tactics *big.Int, vals [25]uint8) (*big.Int, error) {
	return _Goalrev.Contract.SetStaminaRecovery(&_Goalrev.CallOpts, tactics, vals)
}

// TeamsGetTired is a free data retrieval call binding the contract method 0x0feefab3.
//
// Solidity: function teamsGetTired(uint256[5] skillsTeamA, uint256[5] skillsTeamB, uint256[2] matchLogs) pure returns(uint256[5], uint256[5])
func (_Goalrev *GoalrevCaller) TeamsGetTired(opts *bind.CallOpts, skillsTeamA [5]*big.Int, skillsTeamB [5]*big.Int, matchLogs [2]*big.Int) ([5]*big.Int, [5]*big.Int, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "teamsGetTired", skillsTeamA, skillsTeamB, matchLogs)

	if err != nil {
		return *new([5]*big.Int), *new([5]*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new([5]*big.Int)).(*[5]*big.Int)
	out1 := *abi.ConvertType(out[1], new([5]*big.Int)).(*[5]*big.Int)

	return out0, out1, err

}

// TeamsGetTired is a free data retrieval call binding the contract method 0x0feefab3.
//
// Solidity: function teamsGetTired(uint256[5] skillsTeamA, uint256[5] skillsTeamB, uint256[2] matchLogs) pure returns(uint256[5], uint256[5])
func (_Goalrev *GoalrevSession) TeamsGetTired(skillsTeamA [5]*big.Int, skillsTeamB [5]*big.Int, matchLogs [2]*big.Int) ([5]*big.Int, [5]*big.Int, error) {
	return _Goalrev.Contract.TeamsGetTired(&_Goalrev.CallOpts, skillsTeamA, skillsTeamB, matchLogs)
}

// TeamsGetTired is a free data retrieval call binding the contract method 0x0feefab3.
//
// Solidity: function teamsGetTired(uint256[5] skillsTeamA, uint256[5] skillsTeamB, uint256[2] matchLogs) pure returns(uint256[5], uint256[5])
func (_Goalrev *GoalrevCallerSession) TeamsGetTired(skillsTeamA [5]*big.Int, skillsTeamB [5]*big.Int, matchLogs [2]*big.Int) ([5]*big.Int, [5]*big.Int, error) {
	return _Goalrev.Contract.TeamsGetTired(&_Goalrev.CallOpts, skillsTeamA, skillsTeamB, matchLogs)
}

// ThrowDice is a free data retrieval call binding the contract method 0x9c669166.
//
// Solidity: function throwDice(uint256 weight0, uint256 weight1, uint256 rndNum) pure returns(uint8)
func (_Goalrev *GoalrevCaller) ThrowDice(opts *bind.CallOpts, weight0 *big.Int, weight1 *big.Int, rndNum *big.Int) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "throwDice", weight0, weight1, rndNum)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// ThrowDice is a free data retrieval call binding the contract method 0x9c669166.
//
// Solidity: function throwDice(uint256 weight0, uint256 weight1, uint256 rndNum) pure returns(uint8)
func (_Goalrev *GoalrevSession) ThrowDice(weight0 *big.Int, weight1 *big.Int, rndNum *big.Int) (uint8, error) {
	return _Goalrev.Contract.ThrowDice(&_Goalrev.CallOpts, weight0, weight1, rndNum)
}

// ThrowDice is a free data retrieval call binding the contract method 0x9c669166.
//
// Solidity: function throwDice(uint256 weight0, uint256 weight1, uint256 rndNum) pure returns(uint8)
func (_Goalrev *GoalrevCallerSession) ThrowDice(weight0 *big.Int, weight1 *big.Int, rndNum *big.Int) (uint8, error) {
	return _Goalrev.Contract.ThrowDice(&_Goalrev.CallOpts, weight0, weight1, rndNum)
}

// ThrowDiceArray is a free data retrieval call binding the contract method 0xfb985369.
//
// Solidity: function throwDiceArray(uint256[] weights, uint256 rndNum) pure returns(uint8 w)
func (_Goalrev *GoalrevCaller) ThrowDiceArray(opts *bind.CallOpts, weights []*big.Int, rndNum *big.Int) (uint8, error) {
	var out []interface{}
	err := _Goalrev.contract.Call(opts, &out, "throwDiceArray", weights, rndNum)

	if err != nil {
		return *new(uint8), err
	}

	out0 := *abi.ConvertType(out[0], new(uint8)).(*uint8)

	return out0, err

}

// ThrowDiceArray is a free data retrieval call binding the contract method 0xfb985369.
//
// Solidity: function throwDiceArray(uint256[] weights, uint256 rndNum) pure returns(uint8 w)
func (_Goalrev *GoalrevSession) ThrowDiceArray(weights []*big.Int, rndNum *big.Int) (uint8, error) {
	return _Goalrev.Contract.ThrowDiceArray(&_Goalrev.CallOpts, weights, rndNum)
}

// ThrowDiceArray is a free data retrieval call binding the contract method 0xfb985369.
//
// Solidity: function throwDiceArray(uint256[] weights, uint256 rndNum) pure returns(uint8 w)
func (_Goalrev *GoalrevCallerSession) ThrowDiceArray(weights []*big.Int, rndNum *big.Int) (uint8, error) {
	return _Goalrev.Contract.ThrowDiceArray(&_Goalrev.CallOpts, weights, rndNum)
}
