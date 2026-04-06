/* 1. Establish the connection */
cas mysess;
caslib _all_ assign;

libname mypg postgres 
    server="pg-6c91b0b-mtickle-87a8.b.aivencloud.com" 
    port=12132 
    database="games" 
    user="avnadmin" 
    password="AVNS_7S3tKQPAHOd6uTZshyB" 
    schema="showdowns";

proc copy inlib=mypg outlib=PUBLIC;
   select showdowns player_turns;
run;

proc casutil;
   droptable incaslib="PUBLIC" casdata="PLAYER_TURNS_FINAL" quiet;
quit;

data PUBLIC.PLAYER_TURNS_FINAL(promote=yes replace=yes);
   set PUBLIC.player_turns;
   length Player_Name $20;
   if player_index = 0 then Player_Name = "Contestant 1";
   else if player_index = 1 then Player_Name = "Contestant 2";
   else if player_index = 2 then Player_Name = "Contestant 3";
   else Player_Name = "Unknown";
run;

data PUBLIC.SHOWDOWNS_FINAL(promote=yes replace=yes);
   set PUBLIC.showdowns;
   length Winner_Name $20;
   if winner_index = 0 then Winner_Name = "Contestant 1";
   else if winner_index = 1 then Winner_Name = "Contestant 2";
   else if winner_index = 2 then Winner_Name = "Contestant 3";
   else Winner_Name = "Unknown";
run;

/* proc fedsql sessref=mysess;
   select * from PUBLIC."player_turns_final"; 
quit; */

cas mysess terminate;