import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Player = {
    playerId : Principal;
    username : Text;
    xp : Nat;
    coins : Nat;
    gamesPlayed : Nat;
    wins : Nat;
    bestScore : Nat;
    recentScores : [Nat];
  };

  module Player {
    public func compare(p1 : Player, p2 : Player) : Order.Order {
      Nat.compare(p2.bestScore, p1.bestScore);
    };
  };

  public type PlayerStats = {
    level : Nat;
    xp : Nat;
    coins : Nat;
    gamesPlayed : Nat;
    wins : Nat;
    bestScore : Nat;
    recentScores : [Nat];
  };

  public type GameResult = {
    score : Nat;
    won : Bool;
  };

  public type LeaderboardEntry = {
    rank : Nat;
    username : Text;
    bestScore : Nat;
    wins : Nat;
    level : Nat;
  };

  let playersStore = Map.empty<Principal, Player>();

  public shared ({ caller }) func registerOrUpdateProfile(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register or update profiles");
    };
    
    if (username == "") {
      Runtime.trap("Username cannot be empty");
    };
    switch (playersStore.get(caller)) {
      case (?existingPlayer) {
        let updatedPlayer : Player = {
          existingPlayer with
          username;
        };
        playersStore.add(caller, updatedPlayer);
      };
      case (null) {
        let newPlayer : Player = {
          playerId = caller;
          username;
          xp = 0;
          coins = 0;
          gamesPlayed = 0;
          wins = 0;
          bestScore = 0;
          recentScores = [];
        };
        playersStore.add(caller, newPlayer);
      };
    };
  };

  public query ({ caller }) func getOwnProfile() : async Player {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their own profile");
    };
    
    switch (playersStore.get(caller)) {
      case (?player) { player };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  public query ({ caller }) func getPlayerProfile(user : Principal) : async Player {
    // Public function - anyone can view any player's profile for leaderboard purposes
    switch (playersStore.get(user)) {
      case (?player) { player };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  public shared ({ caller }) func submitGameResult(gameResult : GameResult) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit game results");
    };
    
    if (gameResult.score > 100000) {
      Runtime.trap("Invalid score. No new XP or coins awarded.");
    };

    switch (playersStore.get(caller)) {
      case (null) { Runtime.trap("Player not found") };
      case (?player) {
        let newXp = player.xp + (gameResult.score / 10);
        let newCoins = player.coins + (gameResult.score / 20);

        let newRecentScores = updateRecentScores(player.recentScores, gameResult.score);

        let updatedPlayer : Player = {
          player with
          xp = newXp;
          coins = newCoins;
          gamesPlayed = player.gamesPlayed + 1;
          wins = player.wins + (if (gameResult.won) { 1 } else { 0 });
          bestScore = if (gameResult.score > player.bestScore) {
            gameResult.score;
          } else { player.bestScore };
          recentScores = newRecentScores;
        };
        playersStore.add(caller, updatedPlayer);
      };
    };
  };

  public query ({ caller }) func getPlayerStats() : async PlayerStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their own stats");
    };
    
    switch (playersStore.get(caller)) {
      case (?player) {
        {
          level = calculateLevel(player.xp);
          xp = player.xp;
          coins = player.coins;
          gamesPlayed = player.gamesPlayed;
          wins = player.wins;
          bestScore = player.bestScore;
          recentScores = player.recentScores;
        };
      };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  public query ({ caller }) func getOwnLevel() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their own level");
    };
    
    switch (playersStore.get(caller)) {
      case (?player) { calculateLevel(player.xp) };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  public query ({ caller }) func getOwnWinRatePercentage() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their own win rate");
    };
    
    switch (playersStore.get(caller)) {
      case (?player) {
        if (player.gamesPlayed == 0) {
          0;
        } else {
          (player.wins * 100) / player.gamesPlayed;
        };
      };
      case (null) { Runtime.trap("Player not found") };
    };
  };

  public query ({ caller }) func getLeaderboard() : async [LeaderboardEntry] {
    // Public function - anyone including guests can view the leaderboard
    let allPlayersList = playersStore.values().toArray();
    let sortedPlayers = allPlayersList.sort();

    var leaderboardEntries : [LeaderboardEntry] = [];
    var rank = 1;
    for (player in sortedPlayers.values()) {
      if (rank <= 10) {
        leaderboardEntries := leaderboardEntries.concat(
          [
            {
              rank;
              username = player.username;
              bestScore = player.bestScore;
              wins = player.wins;
              level = calculateLevel(player.xp);
            },
          ],
        );
        rank += 1;
      };
    };

    leaderboardEntries;
  };

  func updateRecentScores(scores : [Nat], newScore : Nat) : [Nat] {
    let scoresList = List.empty<Nat>();
    scoresList.add(newScore);

    let existingScoresIter = scores.values();
    var count = 0;

    for (score in existingScoresIter) {
      if (count < 4) {
        scoresList.add(score);
        count += 1;
      };
    };

    scoresList.toArray();
  };

  func calculateLevel(xp : Nat) : Nat {
    xp / 500;
  };
};
