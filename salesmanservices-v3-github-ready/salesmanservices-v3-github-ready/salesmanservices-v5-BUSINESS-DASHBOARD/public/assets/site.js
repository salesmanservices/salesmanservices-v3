
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let pricing={"usdPerMillionGp": 0.27, "quests": [{"name": "A Kingdom Divided", "usd": 5.0, "notes": ""}, {"name": "A Night At The Theatre", "usd": 7.0, "notes": ""}, {"name": "A Porcine of Interest", "usd": 0.7, "notes": ""}, {"name": "A Soul's Bane", "usd": 1.3, "notes": ""}, {"name": "A Tail of Two Cats", "usd": 1.5, "notes": ""}, {"name": "A Taste of Hope", "usd": 2.0, "notes": ""}, {"name": "Animal Magnetism", "usd": 1.0, "notes": ""}, {"name": "Another Slice of H.A.M.", "usd": 1.0, "notes": ""}, {"name": "At First Light", "usd": 1.0, "notes": ""}, {"name": "Beneath Cursed Sands", "usd": 3.5, "notes": ""}, {"name": "Between A Rock", "usd": 2.0, "notes": ""}, {"name": "Big Chompy Bird Hunting", "usd": 0.8, "notes": ""}, {"name": "Biohazard", "usd": 0.8, "notes": ""}, {"name": "Bone Voyage", "usd": 0.8, "notes": ""}, {"name": "Cabin Fever", "usd": 1.3, "notes": ""}, {"name": "Children of The Sun", "usd": 0.7, "notes": ""}, {"name": "Client of Kourend", "usd": 0.9, "notes": ""}, {"name": "Clock Tower", "usd": 0.6, "notes": ""}, {"name": "Cold War", "usd": 1.2, "notes": ""}, {"name": "Contact!", "usd": 1.2, "notes": ""}, {"name": "Creature of Fenkenstrain", "usd": 0.8, "notes": ""}, {"name": "Darkness of Hallowvale", "usd": 2.0, "notes": ""}, {"name": "Death on the Isle", "usd": 2.4, "notes": ""}, {"name": "Death Plateau", "usd": 0.7, "notes": ""}, {"name": "Death To The Dorgeshuun", "usd": 1.1, "notes": ""}, {"name": "Defender of Varrock", "usd": 1.0, "notes": ""}, {"name": "Desert Treasure 1", "usd": 5.0, "notes": ""}, {"name": "Desert Treasure 2", "usd": 9.0, "notes": ""}, {"name": "Desert Treasure 2 v2", "usd": 12.0, "notes": "Low Combat or Ironman"}, {"name": "Devious Minds", "usd": 0.8, "notes": ""}, {"name": "Dragon Slayer 2", "usd": 6.0, "notes": ""}, {"name": "Dragon Slayer 2 v2", "usd": 9.0, "notes": "Low Combat or Ironman"}, {"name": "Dream Mentor", "usd": 2.0, "notes": ""}, {"name": "Druidic Ritual", "usd": 0.5, "notes": ""}, {"name": "Dwarf Cannon", "usd": 0.5, "notes": ""}, {"name": "Eadgar's Ruse", "usd": 1.0, "notes": ""}, {"name": "Eagles Peak", "usd": 1.0, "notes": ""}, {"name": "Elemental Workshop 1", "usd": 0.6, "notes": ""}, {"name": "Elemental Workshop 2", "usd": 0.9, "notes": ""}, {"name": "Enakhra's Lament", "usd": 0.9, "notes": ""}, {"name": "Enlightened Journey", "usd": 0.8, "notes": ""}, {"name": "Ethically Acquired Antiquities", "usd": 0.6, "notes": ""}, {"name": "Fairytale 1 - Growing Pains", "usd": 1.4, "notes": ""}, {"name": "Fairytale 2 - Cure a Queen", "usd": 1.5, "notes": ""}, {"name": "Family Crest", "usd": 1.2, "notes": ""}, {"name": "Fight Arena", "usd": 0.8, "notes": ""}, {"name": "Fishing Contest", "usd": 0.6, "notes": ""}, {"name": "Forgettable Tale", "usd": 3.0, "notes": ""}, {"name": "Garden of Tranquillity", "usd": 2.3, "notes": ""}, {"name": "Gertrude's Cat", "usd": 0.6, "notes": ""}, {"name": "Getting Ahead", "usd": 0.7, "notes": ""}, {"name": "Ghosts Ahoy", "usd": 1.3, "notes": ""}, {"name": "Grim Tales", "usd": 1.4, "notes": ""}, {"name": "Haunted Mine", "usd": 2.0, "notes": ""}, {"name": "Hazeel Cult", "usd": 0.6, "notes": ""}, {"name": "Heroes' Quest", "usd": 1.5, "notes": ""}, {"name": "Holy Grail", "usd": 1.1, "notes": ""}, {"name": "Horror From The Deep", "usd": 1.2, "notes": ""}, {"name": "Icthlarin's Little Helper", "usd": 2.0, "notes": ""}, {"name": "In Aid of The Myreque", "usd": 2.0, "notes": ""}, {"name": "In Search of The Myreque", "usd": 0.9, "notes": ""}, {"name": "Jungle Potion", "usd": 1.0, "notes": ""}, {"name": "King's Ransom", "usd": 1.0, "notes": ""}, {"name": "Land of The Goblins", "usd": 1.5, "notes": ""}, {"name": "Legends' Quest", "usd": 3.2, "notes": ""}, {"name": "Lost City", "usd": 0.7, "notes": ""}, {"name": "Lunar Diplomacy", "usd": 3.2, "notes": ""}, {"name": "Making Friends With My Arm", "usd": 1.2, "notes": ""}, {"name": "Making History", "usd": 0.8, "notes": ""}, {"name": "Meat and Greet", "usd": 1.0, "notes": ""}, {"name": "Vampyre Slayer", "usd": 1.0, "notes": ""}, {"name": "Monk's Friend", "usd": 0.6, "notes": ""}, {"name": "Monkey Madness 1", "usd": 3.0, "notes": ""}, {"name": "Monkey Madness 2", "usd": 7.5, "notes": ""}, {"name": "Monkey Madness 2 v2", "usd": 10.0, "notes": "Low Combat or Ironman"}, {"name": "Mountain Daughter", "usd": 1.2, "notes": ""}, {"name": "Mourning's End Part 1", "usd": 1.0, "notes": ""}, {"name": "Mourning's End Part 2", "usd": 5.6, "notes": ""}, {"name": "Murder Mystery", "usd": 0.6, "notes": ""}, {"name": "My Arm's Big Adventure", "usd": 1.4, "notes": ""}, {"name": "Nature Spirit", "usd": 0.6, "notes": ""}, {"name": "Observatory Quest", "usd": 0.9, "notes": ""}, {"name": "Olaf's Quest", "usd": 0.9, "notes": ""}, {"name": "One Small Favour", "usd": 2.0, "notes": ""}, {"name": "Perilous Moons", "usd": 4.0, "notes": ""}, {"name": "Plague City", "usd": 0.9, "notes": ""}, {"name": "Priest In Peril", "usd": 0.8, "notes": ""}, {"name": "Rag And Bone Man 1", "usd": 0.9, "notes": ""}, {"name": "Rag And Bone Man 2", "usd": 3.2, "notes": ""}, {"name": "Ratcatchers", "usd": 2.2, "notes": ""}, {"name": "Recruitment Drive", "usd": 0.9, "notes": ""}, {"name": "Regicide", "usd": 1.9, "notes": ""}, {"name": "Roving Elves", "usd": 1.4, "notes": ""}, {"name": "Royal Trouble", "usd": 1.2, "notes": ""}, {"name": "Rum Deal", "usd": 1.2, "notes": ""}, {"name": "Scorpion Catcher", "usd": 1.4, "notes": ""}, {"name": "Sea Slug", "usd": 1.2, "notes": ""}, {"name": "Secrets of The North", "usd": 1.9, "notes": ""}, {"name": "Shades of Mort'ton", "usd": 1.2, "notes": ""}, {"name": "Shadow of The Storm", "usd": 1.2, "notes": ""}, {"name": "Sheep Herder", "usd": 0.9, "notes": ""}, {"name": "Shilo Village", "usd": 1.4, "notes": ""}, {"name": "Sins of The Father", "usd": 5.0, "notes": ""}, {"name": "Sleeping Giants", "usd": 0.9, "notes": ""}, {"name": "Song of The Elves", "usd": 8.0, "notes": ""}, {"name": "Song of The Elves v2", "usd": 12.0, "notes": "Low Combat or Ironman"}, {"name": "Spirits of The Elid", "usd": 1.2, "notes": ""}, {"name": "Swan Song", "usd": 1.6, "notes": ""}, {"name": "Tai Bwo Wannai Trio", "usd": 1.2, "notes": ""}, {"name": "Tale of The Righteous", "usd": 1.2, "notes": ""}, {"name": "Tears of Guthix", "usd": 0.6, "notes": ""}, {"name": "Temple of Ikov", "usd": 1.2, "notes": ""}, {"name": "Temple of The Eye", "usd": 1.4, "notes": ""}, {"name": "The Ascent of Arceuus", "usd": 0.8, "notes": ""}, {"name": "The Depths of Despair", "usd": 0.6, "notes": ""}, {"name": "The Dig Site", "usd": 1.2, "notes": ""}, {"name": "The Eyes of Glouphrie", "usd": 1.0, "notes": ""}, {"name": "The Feud", "usd": 1.2, "notes": ""}, {"name": "The Forsaken Tower", "usd": 0.8, "notes": ""}, {"name": "The Fremennik Exiles", "usd": 3.0, "notes": ""}, {"name": "The Fremennik Isles", "usd": 2.0, "notes": ""}, {"name": "The Fremennik Trials", "usd": 1.5, "notes": ""}, {"name": "The Garden of Death", "usd": 1.9, "notes": ""}, {"name": "The Giant Dwarf", "usd": 1.0, "notes": ""}, {"name": "The Golem", "usd": 0.8, "notes": ""}, {"name": "The Grand Tree", "usd": 0.9, "notes": ""}, {"name": "The Great Brain Robbery", "usd": 1.2, "notes": ""}, {"name": "The Hand In The Sand", "usd": 1.0, "notes": ""}, {"name": "The Lost Tribe", "usd": 0.8, "notes": ""}, {"name": "The Path of Glouphrie", "usd": 0.9, "notes": ""}, {"name": "The Queen of Thieves", "usd": 1.0, "notes": ""}, {"name": "The Ribbiting Tale of A Lily Pad Labour Dispute", "usd": 1.0, "notes": ""}, {"name": "The Slug Menace", "usd": 0.9, "notes": ""}, {"name": "The Tourist Trap", "usd": 1.2, "notes": ""}, {"name": "Throne of Miscellania", "usd": 2.0, "notes": ""}, {"name": "Tower of Life", "usd": 1.3, "notes": ""}, {"name": "Tree Gnome Village", "usd": 1.0, "notes": ""}, {"name": "Tribal Totem", "usd": 0.85, "notes": ""}, {"name": "Troll Romance", "usd": 1.2, "notes": ""}, {"name": "Troll Stronghold", "usd": 0.85, "notes": ""}, {"name": "Twilight's Promise", "usd": 0.8, "notes": ""}, {"name": "Underground Pass", "usd": 2.0, "notes": ""}, {"name": "Wanted!", "usd": 1.6, "notes": ""}, {"name": "Watchtower", "usd": 1.6, "notes": ""}, {"name": "Waterfall Quest", "usd": 1.0, "notes": ""}, {"name": "What Lies Below", "usd": 1.3, "notes": ""}, {"name": "While Guthix Sleeps", "usd": 12.0, "notes": ""}, {"name": "Witch's House", "usd": 1.0, "notes": ""}, {"name": "Zogre Flesh Eaters", "usd": 1.3, "notes": ""}, {"name": "Black Knights' Fortress", "usd": 0.45, "notes": ""}, {"name": "Cook's Assistant", "usd": 0.45, "notes": ""}, {"name": "Demon Slayer", "usd": 0.5, "notes": ""}, {"name": "Doric's Quest", "usd": 0.2, "notes": ""}, {"name": "Dragon Slayer 1", "usd": 1.5, "notes": ""}, {"name": "Ernest The Chicken", "usd": 0.5, "notes": ""}, {"name": "Goblin Diplomacy", "usd": 0.5, "notes": ""}, {"name": "Imp Catcher", "usd": 0.5, "notes": ""}, {"name": "Misthalin Mystery", "usd": 0.7, "notes": ""}, {"name": "Pirate's Treasure", "usd": 0.7, "notes": ""}, {"name": "Prince Ali Rescue", "usd": 0.9, "notes": ""}, {"name": "The Restless Ghost", "usd": 0.65, "notes": ""}, {"name": "Romeo & Juliet", "usd": 0.5, "notes": ""}, {"name": "Rune Mysteries", "usd": 0.5, "notes": ""}, {"name": "Sheep Shearer", "usd": 0.4, "notes": ""}, {"name": "Shield of Arrav", "usd": 0.7, "notes": ""}, {"name": "The Corsair Curse", "usd": 0.9, "notes": ""}, {"name": "The Knight's Sword", "usd": 0.6, "notes": ""}, {"name": "Vampyre Slayer", "usd": 0.6, "notes": ""}, {"name": "Witch's Potion", "usd": 0.4, "notes": ""}, {"name": "X Marks The Spot", "usd": 0.5, "notes": ""}, {"name": "Alfred Grimhand's Barcrawl", "usd": 1.0, "notes": ""}, {"name": "Barbarian Training", "usd": 2.0, "notes": ""}, {"name": "Bear Your Soul", "usd": 0.48, "notes": ""}, {"name": "Curse of The Empty Lord", "usd": 1.28, "notes": ""}, {"name": "Daddy's Home", "usd": 0.5, "notes": ""}, {"name": "Enter The Abyss", "usd": 0.5, "notes": ""}, {"name": "Family Pest", "usd": 0.5, "notes": ""}, {"name": "His Faithful Servants", "usd": 0.5, "notes": ""}, {"name": "Hopespear's Will", "usd": 0.8, "notes": ""}, {"name": "In Search of Knowledge", "usd": 1.5, "notes": ""}, {"name": "Into The Tombs", "usd": 2.0, "notes": ""}, {"name": "Lair of Tarn Razorlor", "usd": 0.6, "notes": ""}, {"name": "Skippy And The Mogre", "usd": 0.3, "notes": ""}, {"name": "The Enchanted Key", "usd": 1.5, "notes": ""}, {"name": "The Frozen Door", "usd": 5.0, "notes": ""}, {"name": "The General's Shadow", "usd": 0.8, "notes": ""}, {"name": "Recipe for Disaster full", "usd": 9.0, "notes": ""}, {"name": "Rfd Fight", "usd": 1.5, "notes": ""}, {"name": "Another Cooks Quest", "usd": 0.48, "notes": ""}, {"name": "Evil Dave", "usd": 0.96, "notes": ""}, {"name": "King Awowogei", "usd": 1.6, "notes": ""}, {"name": "Pirate Pete", "usd": 0.96, "notes": ""}, {"name": "Sir Amik Varze", "usd": 1.28, "notes": ""}, {"name": "Skrach Uglogwee", "usd": 2.24, "notes": ""}, {"name": "Goblin Generals", "usd": 0.96, "notes": ""}, {"name": "Lumbridge Guide", "usd": 0.96, "notes": ""}, {"name": "Mountain Dwarf", "usd": 0.96, "notes": ""}, {"name": "The Heart of Darkness", "usd": 1.6, "notes": ""}, {"name": "Below Ice Mountain", "usd": 0.85, "notes": ""}, {"name": "Prying Times", "usd": 1.6, "notes": ""}, {"name": "Pandemonium", "usd": 1.6, "notes": ""}, {"name": "The Curse of Arrav", "usd": 5.0, "notes": ""}, {"name": "The Final Dawn", "usd": 6.0, "notes": ""}, {"name": "Scrambled!", "usd": 2.0, "notes": ""}, {"name": "Shadows of Custodia", "usd": 5.0, "notes": ""}, {"name": "Mage Arena 1", "usd": 3.0, "notes": ""}, {"name": "Mage Arena 2", "usd": 5.0, "notes": ""}, {"name": "Pandemonium", "usd": 1.0, "notes": ""}, {"name": "Prying Times", "usd": 1.0, "notes": ""}, {"name": "Current Affairs", "usd": 1.0, "notes": ""}, {"name": "Troubled Tortugans", "usd": 4.0, "notes": ""}], "minigames": [{"game": "Barbarian Assault", "item": "Fighter Torso", "usd": 9.0, "notes": ""}, {"game": "Barbarian Assault", "item": "Fighter Hat", "usd": 8.0, "notes": "Each Hat"}, {"game": "Barbarian Assault", "item": "Penance skirt", "usd": 9.0, "notes": ""}, {"game": "Barbarian Assault", "item": "Penance gloves", "usd": 5.0, "notes": ""}, {"game": "Barbarian Assault", "item": "Penance boots", "usd": 6.0, "notes": ""}, {"game": "Barbarian Assault", "item": "Queen Kill", "usd": 4.0, "notes": ""}, {"game": "Barbarian Assault", "item": "Level 5 role", "usd": 10.0, "notes": ""}, {"game": "Barbarian Assault", "item": "Level 5 all roles", "usd": 40.0, "notes": ""}, {"game": "Mage Training Arena", "item": "Pizazz points", "usd": 0.0037, "notes": ""}, {"game": "Warriors' Guild", "item": "None to Rune", "usd": 9.0, "notes": ""}, {"game": "Warriors' Guild", "item": "None to Dragon", "usd": 15.0, "notes": ""}, {"game": "Warriors' Guild", "item": "Extra Defenders", "usd": 2.0, "notes": ""}, {"game": "Pest control", "item": "Novice", "usd": 0.025, "notes": ""}, {"game": "Pest control", "item": "Intermediate", "usd": 0.02, "notes": ""}, {"game": "Pest control", "item": "Veteran", "usd": 0.015, "notes": ""}, {"game": "Outfits", "item": "Lumberjack", "usd": 3.2, "notes": ""}, {"game": "Outfits", "item": "Rogue", "usd": 4.0, "notes": ""}, {"game": "Outfits", "item": "Angler", "usd": 8.0, "notes": ""}, {"game": "Outfits", "item": "Farmer", "usd": 12.0, "notes": ""}, {"game": "Outfits", "item": "Prospector", "usd": 20.0, "notes": ""}, {"game": "Outfits", "item": "Graceful", "usd": 20.0, "notes": ""}, {"game": "Outfits", "item": "Alchemist", "usd": 25.0, "notes": ""}, {"game": "Outfits", "item": "Pyromancer", "usd": 30.0, "notes": ""}, {"game": "Outfits", "item": "Smiths' Uniform", "usd": 32.0, "notes": ""}, {"game": "Outfits", "item": "Carpenter", "usd": 33.0, "notes": ""}, {"game": "Outfits", "item": "Black Graceful", "usd": 35.0, "notes": ""}, {"game": "Outfits", "item": "Gotr outfit", "usd": 55.0, "notes": ""}, {"game": "Mage arena", "item": "Cape Mage 1", "usd": 3.0, "notes": ""}, {"game": "Mage arena", "item": "Cape Mage 2", "usd": 5.0, "notes": ""}, {"game": "Mage arena", "item": "Additional God Cape", "usd": 4.5, "notes": ""}, {"game": "Mage arena", "item": "Unlocking - One Spell", "usd": 0.65, "notes": ""}, {"game": "Mage arena", "item": "Unlocking - All Spell", "usd": 4.5, "notes": ""}, {"game": "Mage arena", "item": "10 Extra imbued capes", "usd": 8.0, "notes": ""}, {"game": "Tithe farm", "item": "Herb sack", "usd": 8.0, "notes": ""}, {"game": "Tithe farm", "item": "Seed box", "usd": 8.0, "notes": ""}, {"game": "Tithe farm", "item": "Gricoller's can", "usd": 6.0, "notes": ""}, {"game": "Tithe farm", "item": "Auto-weed", "usd": 5.0, "notes": ""}, {"game": "Tithe farm", "item": "Per Point", "usd": 0.06, "notes": ""}, {"game": "Castle Wars", "item": "Per Point", "usd": 0.15, "notes": ""}, {"game": "Last Man Standing", "item": "Per Point", "usd": 0.1125, "notes": ""}, {"game": "Last Man Standing", "item": "Rune pouch", "usd": 8.0, "notes": ""}, {"game": "Last Man Standing", "item": "Rune pouch note", "usd": 8.0, "notes": ""}, {"game": "Last Man Standing", "item": "Golden Special", "usd": 8.0, "notes": ""}, {"game": "Last Man Standing", "item": "Halos", "usd": 40.0, "notes": ""}, {"game": "Last Man Standing", "item": "Armours", "usd": 16.0, "notes": ""}, {"game": "Soul Wars", "item": "Per Zeal", "usd": 0.03, "notes": ""}, {"game": "Hallowed Sepulchre", "item": "Grand Coffin", "usd": 0.8, "notes": ""}, {"game": "Hallowed Sepulchre", "item": "Hallowed Ring", "usd": 4.0, "notes": ""}, {"game": "Hallowed Sepulchre", "item": "Dark Dye", "usd": 5.0, "notes": ""}, {"game": "Hallowed Sepulchre", "item": "Dark Acorn", "usd": 55.0, "notes": ""}, {"game": "Hallowed Sepulchre", "item": "Hallowed Mark", "usd": 19.0, "notes": ""}, {"game": "Mahogany Homes", "item": "Amy's Saw", "usd": 3.0, "notes": ""}, {"game": "Mahogany Homes", "item": "Plank Sack", "usd": 3.0, "notes": ""}, {"game": "Mahogany Homes", "item": "Hosidius Blueprints", "usd": 15.0, "notes": ""}, {"game": "Mahogany Homes", "item": "Carpenter Set", "usd": 18.0, "notes": ""}, {"game": "Mahogany Homes", "item": "Per Run", "usd": 0.05, "notes": ""}, {"game": "Brimhaven Agility", "item": "Per Ticket", "usd": 0.11, "notes": "Without Elite Karamja"}, {"game": "Brimhaven Agility", "item": "Per Ticket", "usd": 0.1, "notes": "With Karamja Elite"}, {"game": "Wintertodt", "item": "Per Supply Crate", "usd": 0.12, "notes": ""}, {"game": "Tempoross", "item": "Regular Harpoon", "usd": 0.13, "notes": ""}, {"game": "Tempoross", "item": "Dragon Harpoon", "usd": 0.12, "notes": ""}, {"game": "Tempoross", "item": "Crystal Harpoon", "usd": 0.11, "notes": ""}, {"game": "Tempoross", "item": "Infernal Harpoon", "usd": 0.1, "notes": ""}, {"game": "Bounty hunter", "item": "Per Point", "usd": 0.32, "notes": ""}, {"game": "Mastering Mixology", "item": "Prescription goggles", "usd": 20.0, "notes": ""}, {"game": "Mastering Mixology", "item": "Alchemist outfit", "usd": 21.0, "notes": ""}, {"game": "Mastering Mixology", "item": "Reagent pouch", "usd": 32.0, "notes": ""}, {"game": "Mastering Mixology", "item": "Potion storage", "usd": 18.0, "notes": ""}, {"game": "Mastering Mixology", "item": "Chugging barrel", "usd": 40.0, "notes": ""}, {"game": "Mastering Mixology", "item": "Alchemist's amulet", "usd": 16.0, "notes": ""}, {"game": "Mastering Mixology", "item": "Aldarium", "usd": 0.32, "notes": ""}, {"game": "Giants' Foundry", "item": "Bronze/Iron", "usd": 0.0082, "notes": "15 Smithing"}, {"game": "Giants' Foundry", "item": "Iron/Steel", "usd": 0.0072, "notes": "30 Smithing"}, {"game": "Giants' Foundry", "item": "Steel/Mithril", "usd": 0.0062, "notes": "50 Smithing"}, {"game": "Giants' Foundry", "item": "Mithril/Adamant", "usd": 0.0056, "notes": "70 Smithing"}, {"game": "Giants' Foundry", "item": "Adamant/Rune", "usd": 0.0045, "notes": "85 Smithing"}, {"game": "Guardians of The Rift", "item": "Per Searches", "usd": 0.13, "notes": ""}, {"game": "Hunter Rumours", "item": "Novice", "usd": 0.2, "notes": ""}, {"game": "Hunter Rumours", "item": "Adept", "usd": 0.18, "notes": ""}, {"game": "Hunter Rumours", "item": "Expert", "usd": 0.15, "notes": ""}, {"game": "Hunter Rumours", "item": "Master", "usd": 0.12, "notes": ""}, {"game": "Hunter Rumours", "item": "Outfit Piece ea", "usd": 12.0, "notes": ""}, {"game": "Hunter Rumours", "item": "Ful Outfit", "usd": 40.0, "notes": ""}, {"game": "Herbiboar", "item": "Stamina, Herb Sack", "usd": 0.0375, "notes": ""}, {"game": "Herbiboar", "item": "Stamina", "usd": 0.0525, "notes": ""}, {"game": "Herbiboar", "item": "Nothing", "usd": 0.075, "notes": ""}, {"game": "Shooting Stars", "item": "Per Dust", "usd": 0.0016, "notes": ""}, {"game": "Pvp Arena", "item": "Scroll of imbuing", "usd": 5.0, "notes": ""}, {"game": "Monkey backpacks", "item": "Kramjan", "usd": 3.0, "notes": ""}, {"game": "Monkey backpacks", "item": "Zombie", "usd": 8.0, "notes": ""}, {"game": "Monkey backpacks", "item": "Maniacal", "usd": 17.0, "notes": ""}, {"game": "Monkey backpacks", "item": "Skeleton", "usd": 35.0, "notes": ""}, {"game": "Monkey backpacks", "item": "Kruk", "usd": 52.0, "notes": ""}, {"game": "Monkey backpacks", "item": "Princely", "usd": 70.0, "notes": ""}, {"game": "Chompy Birds", "item": "Chompy Birds", "usd": 0.6, "notes": ""}, {"game": "Clue Scroll", "item": "Easy", "usd": 0.08, "notes": ""}, {"game": "Clue Scroll", "item": "Medium", "usd": 0.15, "notes": ""}, {"game": "Clue Scroll", "item": "Hard", "usd": 0.2, "notes": ""}, {"game": "Clue Scroll", "item": "Elite", "usd": 0.3, "notes": ""}, {"game": "Clue Scroll", "item": "Master", "usd": 0.5, "notes": ""}], "capes": [{"name": "TzTok-Jad", "method": "Main - Blowpipe", "usd": 3.0, "notes": ""}, {"name": "TzTok-Jad", "method": "Zerker - Blowpipe", "usd": 4.0, "notes": ""}, {"name": "TzTok-Jad", "method": "Pure - Blowpipe", "usd": 5.0, "notes": ""}, {"name": "TzTok-Jad", "method": "Main - Cbow", "usd": 6.0, "notes": ""}, {"name": "TzTok-Jad", "method": "Zerker - Cbow", "usd": 8.0, "notes": ""}, {"name": "TzTok-Jad", "method": "Pure - Cbow", "usd": 9.0, "notes": ""}, {"name": "TzKal-Zuk", "method": "Main - Twisted Bow", "usd": 10.0, "notes": ""}, {"name": "TzKal-Zuk", "method": "Main - Bowfa", "usd": 10.0, "notes": ""}, {"name": "TzKal-Zuk", "method": "Main - Acbow", "usd": 15.0, "notes": ""}, {"name": "TzKal-Zuk", "method": "Zerker - Twisted Bow", "usd": 15.0, "notes": ""}, {"name": "TzKal-Zuk", "method": "Zerker - Acbow", "usd": 15.0, "notes": ""}, {"name": "TzKal-Zuk", "method": "Pure - Twisted Bow", "usd": 10.0, "notes": ""}, {"name": "TzKal-Zuk", "method": "Pure - Acbow", "usd": 15.0, "notes": ""}, {"name": "Sol Heredit", "method": "Main - Max Gear", "usd": 10.0, "notes": ""}, {"name": "Sol Heredit", "method": "Main - Budget", "usd": 15.0, "notes": ""}, {"name": "Sol Heredit", "method": "Zerker - Max Gear", "usd": 10.0, "notes": ""}, {"name": "Sol Heredit", "method": "Zerker - Budget", "usd": 15.0, "notes": ""}, {"name": "Sol Heredit", "method": "Pure - Max Gear", "usd": 10.0, "notes": ""}, {"name": "Sol Heredit", "method": "Pure - Budget", "usd": 15.0, "notes": ""}], "gpRate": 0.19, "displayGpRate": 0.19, "skillGpPerXp": [{"skill": "Woodcutting", "method": "Woodcutting", "from": 1, "to": 70, "gpPerXp": 225.0}, {"skill": "Woodcutting", "method": "Woodcutting", "from": 70, "to": 99, "gpPerXp": 80.0}, {"skill": "Woodcutting", "method": "Woodcutting", "from": 90, "to": 99, "gpPerXp": 70.0}, {"skill": "Thieving", "method": "Thieving Fasted", "from": 1, "to": 50, "gpPerXp": 210.0}, {"skill": "Thieving", "method": "Thieving Fasted", "from": 50, "to": 90, "gpPerXp": 98.0}, {"skill": "Thieving", "method": "Thieving Fasted", "from": 38, "to": 75, "gpPerXp": 85.0}, {"skill": "Thieving", "method": "Master Farmers", "from": 1, "to": 40, "gpPerXp": 125.0}, {"skill": "Thieving", "method": "Master Farmers", "from": 40, "to": 99, "gpPerXp": 95.0}, {"skill": "Strength", "method": "Sand Crabs", "from": 1, "to": 65, "gpPerXp": 215.0}, {"skill": "Strength", "method": "Sand Crabs", "from": 65, "to": 99, "gpPerXp": 145.0}, {"skill": "Strength", "method": "Sand Crabs Pures", "from": 1, "to": 27, "gpPerXp": 215.0}, {"skill": "Strength", "method": "Sand Crabs Pures", "from": 27, "to": 50, "gpPerXp": 165.0}, {"skill": "Strength", "method": "Nightmare Zone", "from": 50, "to": 99, "gpPerXp": 125.0}, {"skill": "Strength", "method": "Nightmare Zone", "from": 77, "to": 99, "gpPerXp": 120.0}, {"skill": "Smithing", "method": "Efficient Smithing", "from": 27, "to": 85, "gpPerXp": 75.0}, {"skill": "Smithing", "method": "Efficient Smithing", "from": 85, "to": 99, "gpPerXp": 55.0}, {"skill": "Smithing", "method": "Smithing Dart", "from": 1, "to": 99, "gpPerXp": 100.0}, {"skill": "Slayer", "method": "Main -100", "from": 1, "to": 60, "gpPerXp": 350.0}, {"skill": "Slayer", "method": "Main -100", "from": 60, "to": 99, "gpPerXp": 250.0}, {"skill": "Slayer", "method": "Main +100", "from": 30, "to": 72, "gpPerXp": 250.0}, {"skill": "Slayer", "method": "Main +100", "from": 72, "to": 99, "gpPerXp": 200.0}, {"skill": "Slayer", "method": "Ironman -100", "from": 1, "to": 29, "gpPerXp": 450.0}, {"skill": "Slayer", "method": "Ironman -100", "from": 29, "to": 47, "gpPerXp": 300.0}, {"skill": "Slayer", "method": "Ironman +100", "from": 47, "to": 67, "gpPerXp": 350.0}, {"skill": "Slayer", "method": "Ironman +100", "from": 67, "to": 99, "gpPerXp": 250.0}, {"skill": "Runecrafting", "method": "Efficient Runecrafting", "from": 46, "to": 57, "gpPerXp": 550.0}, {"skill": "Runecrafting", "method": "Efficient Runecrafting", "from": 57, "to": 72, "gpPerXp": 320.0}, {"skill": "Runecrafting", "method": "Efficient Runecrafting", "from": 72, "to": 91, "gpPerXp": 200.0}, {"skill": "Runecrafting", "method": "Blood Rune", "from": 91, "to": 99, "gpPerXp": 130.0}, {"skill": "Runecrafting", "method": "Soul Rune", "from": 3, "to": 52, "gpPerXp": 110.0}, {"skill": "Runecrafting", "method": "Guardian of the Rift", "from": 52, "to": 81, "gpPerXp": 175.0}, {"skill": "Runecrafting", "method": "Guardian of the Rift", "from": 81, "to": 99, "gpPerXp": 135.0}, {"skill": "Ranged", "method": "Sand Crabs", "from": 1, "to": 52, "gpPerXp": 215.0}, {"skill": "Ranged", "method": "Sand Crabs", "from": 52, "to": 67, "gpPerXp": 185.0}, {"skill": "Ranged", "method": "Sand Crabs - Pure/Zerkers", "from": 1, "to": 55, "gpPerXp": 245.0}, {"skill": "Ranged", "method": "Sand Crabs - Pure/Zerkers", "from": 55, "to": 70, "gpPerXp": 235.0}, {"skill": "Ranged", "method": "Chinning MM1 Tunnel", "from": 70, "to": 85, "gpPerXp": 75.0}, {"skill": "Ranged", "method": "Chinning MM2 Tunnel", "from": 1, "to": 48, "gpPerXp": 55.0}, {"skill": "Ranged", "method": "Nightmare Zone", "from": 48, "to": 70, "gpPerXp": 65.0}, {"skill": "Prayer", "method": "Chaos Altar", "from": 82, "to": 99, "gpPerXp": 45.0}, {"skill": "Prayer", "method": "Chaos Altar", "from": 1, "to": 35, "gpPerXp": 35.0}, {"skill": "Prayer", "method": "Gilded Altar", "from": 35, "to": 99, "gpPerXp": 30.0}, {"skill": "Prayer", "method": "Gilded Altar", "from": 45, "to": 99, "gpPerXp": 17.0}, {"skill": "Mining", "method": "Power Mining", "from": 1, "to": 34, "gpPerXp": 185.0}, {"skill": "Mining", "method": "Power Mining", "from": 34, "to": 54, "gpPerXp": 155.0}, {"skill": "Mining", "method": "Motherlode Mine", "from": 54, "to": 75, "gpPerXp": 135.0}, {"skill": "Mining", "method": "Motherlode Mine", "from": 1, "to": 54, "gpPerXp": 155.0}, {"skill": "Magic", "method": "Sand Crabs", "from": 54, "to": 99, "gpPerXp": 185.0}, {"skill": "Magic", "method": "Sand Crabs", "from": 46, "to": 87, "gpPerXp": 105.0}, {"skill": "Magic", "method": "Sand Crabs Pures", "from": 87, "to": 99, "gpPerXp": 205.0}, {"skill": "Magic", "method": "Sand Crabs Pures", "from": 52, "to": 99, "gpPerXp": 95.0}, {"skill": "Magic", "method": "Chinning MM1 Tunnel", "from": 30, "to": 99, "gpPerXp": 55.0}, {"skill": "Magic", "method": "Chinning MM2 Tunnel", "from": 1, "to": 22, "gpPerXp": 45.0}, {"skill": "Hunter", "method": "Efficient Hunter", "from": 22, "to": 52, "gpPerXp": 285.0}, {"skill": "Hunter", "method": "Efficient Hunter", "from": 20, "to": 30, "gpPerXp": 200.0}, {"skill": "Hunter", "method": "Efficient Hunter", "from": 30, "to": 40, "gpPerXp": 120.0}, {"skill": "Hunter", "method": "Efficient Hunter", "from": 40, "to": 60, "gpPerXp": 90.0}, {"skill": "Hunter", "method": "Hunter Rumours", "from": 60, "to": 80, "gpPerXp": 190.0}, {"skill": "Hunter", "method": "Hunter Rumours", "from": 80, "to": 90, "gpPerXp": 150.0}, {"skill": "Hunter", "method": "Hunter Rumours", "from": 75, "to": 99, "gpPerXp": 120.0}, {"skill": "Hunter", "method": "Hunter Rumours", "from": 91, "to": 99, "gpPerXp": 90.0}, {"skill": "Herblore", "method": "Efficient Herblore", "from": 3, "to": 52, "gpPerXp": 70.0}, {"skill": "Herblore", "method": "Efficient Herblore", "from": 52, "to": 81, "gpPerXp": 60.0}, {"skill": "Herblore", "method": "Efficient Herblore", "from": 81, "to": 99, "gpPerXp": 50.0}, {"skill": "Fletching", "method": "Efficient Darts", "from": 1, "to": 52, "gpPerXp": 35.0}, {"skill": "Fletching", "method": "Efficient Darts", "from": 52, "to": 67, "gpPerXp": 23.0}, {"skill": "Fletching", "method": "Efficient Darts", "from": 67, "to": 99, "gpPerXp": 15.0}, {"skill": "Fletching", "method": "Efficient Bows", "from": 1, "to": 55, "gpPerXp": 90.0}, {"skill": "Fletching", "method": "Efficient Bows", "from": 55, "to": 70, "gpPerXp": 60.0}, {"skill": "Fletching", "method": "Efficient Bows", "from": 70, "to": 85, "gpPerXp": 40.0}, {"skill": "Fletching", "method": "Efficient Bows", "from": 85, "to": 99, "gpPerXp": 25.0}, {"skill": "Fishing", "method": "Power Fishing", "from": 1, "to": 48, "gpPerXp": 100.0}, {"skill": "Fishing", "method": "Power Fishing", "from": 48, "to": 70, "gpPerXp": 90.0}, {"skill": "Fishing", "method": "Power Fishing", "from": 70, "to": 99, "gpPerXp": 70.0}, {"skill": "Fishing", "method": "Minnows", "from": 82, "to": 99, "gpPerXp": 90.0}, {"skill": "Fishing", "method": "Tempoross", "from": 1, "to": 35, "gpPerXp": 375.0}, {"skill": "Fishing", "method": "Tempoross", "from": 35, "to": 99, "gpPerXp": 90.0}, {"skill": "Firemaking", "method": "Burning logs", "from": 1, "to": 50, "gpPerXp": 150.0}, {"skill": "Firemaking", "method": "Burning logs", "from": 50, "to": 99, "gpPerXp": 70.0}, {"skill": "Firemaking", "method": "Wintertodt", "from": 50, "to": 99, "gpPerXp": 42.0}, {"skill": "Farming", "method": "Efficient Farming", "from": 1, "to": 34, "gpPerXp": 420.0}, {"skill": "Farming", "method": "Efficient Farming", "from": 34, "to": 54, "gpPerXp": 500.0}, {"skill": "Farming", "method": "Efficient Farming", "from": 54, "to": 75, "gpPerXp": 280.0}, {"skill": "Farming", "method": "Efficient Farming", "from": 75, "to": 99, "gpPerXp": 90.0}, {"skill": "Attack", "method": "Sand Crabs", "from": 1, "to": 70, "gpPerXp": 160.0}, {"skill": "Attack", "method": "Sand Crabs", "from": 70, "to": 99, "gpPerXp": 35.0}, {"skill": "Attack", "method": "Sand Crabs Pures", "from": 1, "to": 70, "gpPerXp": 225.0}, {"skill": "Attack", "method": "Sand Crabs Pures", "from": 70, "to": 99, "gpPerXp": 65.0}, {"skill": "Attack", "method": "Nightmare Zone", "from": 70, "to": 90, "gpPerXp": 25.0}, {"skill": "Attack", "method": "Nightmare Zone", "from": 90, "to": 99, "gpPerXp": 20.0}, {"skill": "Crafting", "method": "Efficient Crafting", "from": 1, "to": 54, "gpPerXp": 170.0}, {"skill": "Crafting", "method": "Efficient Crafting", "from": 54, "to": 99, "gpPerXp": 35.0}, {"skill": "Crafting", "method": "Glassblowing", "from": 46, "to": 87, "gpPerXp": 95.0}, {"skill": "Crafting", "method": "Glassblowing", "from": 87, "to": 99, "gpPerXp": 75.0}, {"skill": "Cooking", "method": "Cook Fishes", "from": 1, "to": 52, "gpPerXp": 90.0}, {"skill": "Cooking", "method": "Cook Fishes", "from": 52, "to": 99, "gpPerXp": 60.0}, {"skill": "Cooking", "method": "Wines", "from": 30, "to": 99, "gpPerXp": 25.0}, {"skill": "Construction", "method": "Efficient method", "from": 1, "to": 22, "gpPerXp": 90.0}, {"skill": "Construction", "method": "Efficient method", "from": 22, "to": 52, "gpPerXp": 40.0}, {"skill": "Construction", "method": "Efficient method", "from": 52, "to": 99, "gpPerXp": 25.0}, {"skill": "Construction", "method": "Mahogany Homes", "from": 1, "to": 50, "gpPerXp": 100.0}, {"skill": "Construction", "method": "Mahogany Homes", "from": 50, "to": 99, "gpPerXp": 50.0}, {"skill": "Defence", "method": "Sand Crabs", "from": 1, "to": 70, "gpPerXp": 175.0}, {"skill": "Defence", "method": "Sand Crabs", "from": 70, "to": 99, "gpPerXp": 45.0}, {"skill": "Defence", "method": "Sand Crabs Pures", "from": 1, "to": 70, "gpPerXp": 250.0}, {"skill": "Defence", "method": "Sand Crabs Pures", "from": 70, "to": 99, "gpPerXp": 85.0}, {"skill": "Defence", "method": "Nightmare Zone", "from": 70, "to": 90, "gpPerXp": 38.0}, {"skill": "Defence", "method": "Nightmare Zone", "from": 90, "to": 99, "gpPerXp": 30.0}, {"skill": "Agility", "method": "Rooftop Course", "from": 1, "to": 20, "gpPerXp": 450.0}, {"skill": "Agility", "method": "Rooftop Course", "from": 20, "to": 30, "gpPerXp": 300.0}, {"skill": "Agility", "method": "Rooftop Course", "from": 30, "to": 40, "gpPerXp": 285.0}, {"skill": "Agility", "method": "Rooftop Course", "from": 40, "to": 60, "gpPerXp": 265.0}, {"skill": "Agility", "method": "Rooftop Course", "from": 60, "to": 80, "gpPerXp": 215.0}, {"skill": "Agility", "method": "Rooftop Course", "from": 80, "to": 90, "gpPerXp": 145.0}, {"skill": "Agility", "method": "Rooftop Course", "from": 90, "to": 99, "gpPerXp": 130.0}, {"skill": "Agility", "method": "Prifddinas Agility Course", "from": 75, "to": 99, "gpPerXp": 135.0}]};
let accounts=[{"id":"zerker-1","type":"Zerker","title":"50 Attack / 45 Defence Zerker #1","price":120,"image":"assets/accounts/zerker-1.png","tags":["50 Attack","45 Defence","PK Ready","Negotiable"],"description":"50 Attack and 45 Defence Zerker shown with its correct original stats, equipment and quest progress.","buy":"https://salesman.sell.app/product/50-attack-zerker?store=salesman&locale=en&quantity=1","button":"Buy securely"},{"id":"med-1","type":"Med Main","title":"60 Attack / 70 Defence Med Main #1","price":140,"image":"assets/accounts/med-main-1.png","tags":["60 Attack","70 Defence","Piety","PK / PvM"],"description":"60 Attack and 70 Defence Med Main shown with the correct stats, equipment and quest screenshot.","buy":"https://salesman.sell.app/product/60-att-70-def-piety-ready-med-main?store=salesman&locale=en&quantity=1","button":"Buy securely"},{"id":"med-2","type":"Med Main","title":"60 Attack / 70 Defence Med Main #2","price":140,"image":"assets/accounts/med-main-2.png","tags":["60 Attack","70 Defence","Piety","PK / PvM"],"description":"Second 60 Attack and 70 Defence Med Main using the correct original account screenshot.","buy":"https://salesman.sell.app/product/60-att-70-def-piety-ready-med-main?store=salesman&locale=en&quantity=1","button":"Buy securely"},{"id":"pure","type":"Pure","title":"1 Defence Pure","price":80,"image":"assets/accounts/pure-stats.png","secondImage":"assets/accounts/pure-inventory.png","tags":["1 Defence","Pure","Transparent History","Negotiable"],"description":"1 Defence Pure shown with the correct stats and inventory screenshots. Previous temporary ban has ended and is no longer active.","buy":"https://discord.gg/HkUCNNQtmG","button":"Reserve on Discord"},{"id":"thieving","type":"Skiller","title":"600+ Total / 99 Thieving","price":35,"image":"assets/accounts/thieving-99.png","tags":["99 Thieving","600+ Total","Skiller","Budget"],"description":"Specialist skiller with 99 Thieving and more than 600 total level.","buy":"https://salesman.sell.app/product/product-600-total-99-thieving-account?store=salesman&locale=en&quantity=1","button":"Buy securely"},{"id":"mining","type":"Skiller","title":"85 Mining Account","price":5,"image":"assets/accounts/mining-85.png","tags":["85 Mining","Starter","Skiller","Budget"],"description":"Low-cost specialist account with 85 Mining. Contact Discord to confirm availability.","buy":"https://discord.gg/HkUCNNQtmG","button":"Buy through Discord"},{"id":"woodcutting","type":"Skiller","title":"99 Woodcutting Skiller","price":5,"image":"assets/accounts/woodcutting-99.png","tags":["99 Woodcutting","Starter","Skiller","Budget"],"description":"Starter skiller with 99 Woodcutting using the correct original account screenshot.","buy":"https://salesman.sell.app/product/product-skiller-99-woodcutting?store=salesman&locale=en&quantity=1","button":"Buy securely"}];
let soldAccounts=[{"id":"zerker-2","type":"Zerker","title":"50 Attack / 45 Defence / 81 Strength Zerker","price":120,"image":"assets/accounts/zerker-2.png","tags":["50 Attack","45 Defence","PK Ready","Negotiable"],"description":"Second 50 Attack and 45 Defence Zerker using the correct original account screenshot.","buy":"https://salesman.sell.app/product/50-attack-zerker?store=salesman&locale=en&quantity=1","button":"Buy securely","status":"sold","soldDate":"July 2026"}];
let currentFilter="All";

const fmtMoney=n=>`$${Number(n||0).toFixed(2)}`;
const fmtGp=n=>`${Number(n||0).toFixed(2).replace(/\.00$/,"")}m GP`;
const gpToUsd=gpM=>Number(gpM||0)*pricing.displayGpRate;

const xpForLevel=level=>{
 let points=0;
 const capped=Math.max(1,Math.min(126,Number(level)));
 for(let lvl=1;lvl<capped;lvl++)points+=Math.floor(lvl+300*Math.pow(2,lvl/7));
 return Math.floor(points/4);
};

const notify=text=>{
 const t=$("#toast");t.textContent=text;t.classList.add("show");
 setTimeout(()=>t.classList.remove("show"),2200);
};
const copyText=async text=>{
 try{await navigator.clipboard.writeText(text);notify("Order request copied")}
 catch{prompt("Copy this request:",text)}
};
const hideLoader=()=>$("#loader")?.classList.add("hidden");
window.addEventListener("DOMContentLoaded",()=>setTimeout(hideLoader,150));
window.addEventListener("load",()=>setTimeout(hideLoader,80));
setTimeout(hideLoader,1600);

$("#year").textContent=new Date().getFullYear();
$("#mobileMenu").onclick=()=>$("#nav").classList.toggle("open");
$$("nav a").forEach(a=>a.onclick=()=>$("#nav").classList.remove("open"));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});
$$(".reveal").forEach(el=>observer.observe(el));

function buildAccounts(){
 const types=["All",...new Set(accounts.map(a=>a.type))];
 $("#accountFilters").innerHTML=types.map(t=>`<button class="${t==="All"?"active":""}" data-filter="${t}">${t}</button>`).join("");
 $$("#accountFilters button").forEach(btn=>btn.onclick=()=>{
  currentFilter=btn.dataset.filter;
  $$("#accountFilters button").forEach(x=>x.classList.toggle("active",x===btn));
  renderAccounts();
 });
 renderAccounts();
}
function renderAccounts(){
 const list=currentFilter==="All"?accounts:accounts.filter(a=>a.type===currentFilter);
 $("#accountGrid").innerHTML=list.map(a=>`
 <article class="account-card">
  <div class="account-image" data-id="${a.id}" style="background-image:url('${a.image}')"></div>
  <div class="account-info">
   <div class="account-meta"><span>${a.type}</span><b>$${a.price}</b></div>
   <h3>${a.title}</h3><p>${a.description}</p>
   <div class="tag-list">${a.tags.map(t=>`<span>${t}</span>`).join("")}</div>
   <a class="button primary" href="${a.buy}" target="_blank" rel="noopener">${a.button}</a>
  </div>
 </article>`).join("");
 $$(".account-image").forEach(el=>el.onclick=()=>openAccount(el.dataset.id));
}
function renderSoldAccounts(){
 const grid=$("#soldAccountGrid");
 if(!grid)return;
 grid.innerHTML=soldAccounts.map(a=>`
 <article class="account-card sold-account-card">
  <div class="account-image sold-account-image" data-sold-id="${a.id}" style="background-image:url('${a.image}')"><span class="sold-ribbon">SOLD</span></div>
  <div class="account-info">
   <div class="account-meta"><span>${a.type}</span><b class="sold-price">Sold</b></div>
   <h3>${a.title}</h3><p>This account has found a new owner. Similar builds may become available again.</p>
   <div class="tag-list"><span>50 Attack</span><span>45 Defence</span><span>81 Strength</span><span>${a.soldDate}</span></div>
   <a class="button ghost" href="https://discord.gg/HkUCNNQtmG" target="_blank" rel="noopener">Ask about similar accounts</a>
  </div>
 </article>`).join("");
}
function openAccount(id){
 const a=accounts.find(x=>x.id===id);if(!a)return;
 $("#modalContent").innerHTML=`
 <div class="modal-gallery ${a.secondImage?"":"single"}">
  <img src="${a.image}" alt="${a.title}">
  ${a.secondImage?`<img src="${a.secondImage}" alt="${a.title} inventory">`:""}
 </div>
 <div class="modal-copy">
  <div class="account-meta"><span>${a.type}</span><b>$${a.price}</b></div>
  <h2>${a.title}</h2><p>${a.description}</p>
  <div class="tag-list">${a.tags.map(t=>`<span>${t}</span>`).join("")}</div>
  <a class="button primary" href="${a.buy}" target="_blank" rel="noopener">${a.button}</a>
 </div>`;
 $("#accountModal").classList.add("open");
}
const closeModal=()=>$("#accountModal").classList.remove("open");
$("#modalClose").onclick=closeModal;
$("#accountModal").onclick=e=>{if(e.target.id==="accountModal")closeModal()};
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

$$(".calculator-tabs button").forEach(btn=>btn.onclick=()=>activateTab(btn.dataset.tab));
$$("[data-tab-link]").forEach(a=>a.onclick=()=>setTimeout(()=>activateTab(a.dataset.tabLink),200));
function activateTab(tab){
 $$(".calculator-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
 $$(".calculator-panel").forEach(p=>p.classList.toggle("active",p.id===`tab-${tab}`));
}

function buildSkill(){
 const skills=[...new Set(pricing.skillGpPerXp.map(x=>x.skill))].sort();
 $("#skillSelect").innerHTML=skills.map(s=>`<option>${s}</option>`).join("");
 $("#skillSelect").onchange=refreshMethods;
 $("#methodSelect").onchange=refreshSuggestedRange;
 $("#levelFrom").oninput=calculateSkill;
 $("#levelTo").oninput=calculateSkill;
 refreshMethods();
}
function selectedRows(){
 return pricing.skillGpPerXp
  .filter(x=>x.skill===$("#skillSelect").value&&x.method===$("#methodSelect").value)
  .sort((a,b)=>a.from-b.from||a.to-b.to);
}
function refreshMethods(){
 const skill=$("#skillSelect").value;
 const methods=[...new Set(pricing.skillGpPerXp.filter(x=>x.skill===skill).map(x=>x.method))];
 $("#methodSelect").innerHTML=methods.map(m=>`<option>${m}</option>`).join("");
 refreshSuggestedRange();
}
function refreshSuggestedRange(){
 const rows=selectedRows();if(!rows.length)return;
 $("#levelFrom").value=Math.min(...rows.map(r=>r.from));
 $("#levelTo").value=Math.max(...rows.map(r=>r.to));
 calculateSkill();
}

/*
 For every small level interval, choose the most specific applicable row:
 the row with the highest starting level, then the narrowest range.
 This handles tier rows such as 1-70, 70-99 and 90-99 without double charging.
*/
function calculateSkill(){
 const rows=selectedRows();
 const from=Number($("#levelFrom").value),to=Number($("#levelTo").value);
 const totalXp=Math.max(0,xpForLevel(to)-xpForLevel(from));
 $("#skillXp").textContent=totalXp.toLocaleString();
 $("#skillMethodSummary").textContent=$("#methodSelect").value||"—";

 if(!rows.length||to<=from||from<1||to>99){
  $("#skillPrice").textContent="Check levels";
  $("#skillGp").textContent="—";
  $("#skillNotes").textContent="Choose a valid current and target level.";
  return;
 }

 const boundaries=new Set([from,to]);
 rows.forEach(r=>{
  if(r.from>from&&r.from<to)boundaries.add(r.from);
  if(r.to>from&&r.to<to)boundaries.add(r.to);
 });
 const points=[...boundaries].sort((a,b)=>a-b);
 let gp=0;
 const breakdown=[];

 for(let i=0;i<points.length-1;i++){
  const low=points[i],high=points[i+1];
  const candidates=rows.filter(r=>r.from<=low&&r.to>=high);
  if(!candidates.length){
   $("#skillPrice").textContent="Exact quote required";
   $("#skillGp").textContent="Discord";
   $("#skillNotes").textContent="This method is not available for the complete selected level range. Please request a custom Discord quote.";
   return;
  }
  candidates.sort((a,b)=>b.from-a.from||(a.to-a.from)-(b.to-b.from));
  const row=candidates[0];
  const xp=xpForLevel(high)-xpForLevel(low);
  const segmentGp=xp*row.gpPerXp;
  gp+=segmentGp;
  breakdown.push(`${low}–${high}: ${row.gpPerXp.toLocaleString()} GP/XP`);
 }

 const gpM=gp/1_000_000;
 $("#skillGp").textContent=fmtGp(gpM);
 $("#skillPrice").textContent=fmtMoney(gpToUsd(gpM));
 $("#skillNotes").textContent="Estimated total based on the selected skill, method and levels.";
}
$("#copySkill").onclick=()=>copyText(
 `Hello, I would like a skilling quote:\nSkill: ${$("#skillSelect").value}\nMethod: ${$("#methodSelect").value}\nLevels: ${$("#levelFrom").value} → ${$("#levelTo").value}\nXP required: ${$("#skillXp").textContent}\nEstimated price: ${$("#skillPrice").textContent}\nOSRS GP: ${$("#skillGp").textContent}`
);

function buildQuests(){
 $("#questList").innerHTML=pricing.quests.map((q,i)=>`
 <label class="choice" data-name="${q.name.toLowerCase()}">
  <input type="checkbox" data-index="${i}">
  <span>${q.name}<b>${fmtMoney(q.usd)} · ${fmtGp(q.usd/pricing.displayGpRate)}</b></span>
 </label>`).join("");
 $$("#questList input").forEach(i=>i.onchange=updateQuestTotal);
 $("#questSearch").oninput=e=>{$$("#questList .choice").forEach(c=>c.style.display=c.dataset.name.includes(e.target.value.toLowerCase())?"flex":"none")};
 $("#copyQuest").onclick=()=>{
  const selected=$$("#questList input:checked").map(i=>pricing.quests[Number(i.dataset.index)]);
  if(!selected.length)return notify("Select at least one quest");
  const usd=selected.reduce((s,q)=>s+q.usd,0);
  copyText(`Hello, I would like a questing quote:\n${selected.map(q=>`- ${q.name} (${fmtMoney(q.usd)} / ${fmtGp(q.usd/pricing.displayGpRate)})`).join("\n")}\nTotal: ${fmtMoney(usd)} / ${fmtGp(usd/pricing.displayGpRate)}`);
 };
}
function updateQuestTotal(){
 const selected=$$("#questList input:checked").map(i=>pricing.quests[Number(i.dataset.index)]);
 const usd=selected.reduce((s,q)=>s+q.usd,0);
 $("#questCount").textContent=`${selected.length} selected`;
 $("#questTotal").textContent=fmtMoney(usd);
 $("#questGpTotal").textContent=fmtGp(usd/pricing.displayGpRate);
}

function buildMinigames(){
 const games=[...new Set(pricing.minigames.map(x=>x.game))];
 $("#miniGame").innerHTML=games.map(g=>`<option>${g}</option>`).join("");
 $("#miniGame").onchange=refreshMiniItems;$("#miniItem").onchange=updateMiniPrice;refreshMiniItems();
 $("#copyMini").onclick=()=>copyText(`Hello, I would like a minigame quote:\nMinigame: ${$("#miniGame").value}\nReward: ${$("#miniItem").selectedOptions[0]?.textContent||""}\nPrice: ${$("#miniPrice").textContent} / ${$("#miniGpPrice").textContent}`);
}
function refreshMiniItems(){
 const rows=pricing.minigames.filter(x=>x.game===$("#miniGame").value);
 $("#miniItem").innerHTML=rows.map((x,i)=>`<option value="${i}">${x.item}</option>`).join("");updateMiniPrice();
}
function updateMiniPrice(){
 const rows=pricing.minigames.filter(x=>x.game===$("#miniGame").value);
 const row=rows[Number($("#miniItem").value)||0];
 $("#miniPrice").textContent=row?fmtMoney(row.usd):"—";
 $("#miniGpPrice").textContent=row?fmtGp(row.usd/pricing.displayGpRate):"—";
}

function buildCapes(){
 const names=[...new Set(pricing.capes.map(x=>x.name))];
 $("#capeName").innerHTML=names.map(n=>`<option>${n}</option>`).join("");
 $("#capeName").onchange=refreshCapeMethods;$("#capeMethod").onchange=updateCapePrice;refreshCapeMethods();
 $("#copyCape").onclick=()=>copyText(`Hello, I would like a cape or Colosseum quote:\nChallenge: ${$("#capeName").value}\nBuild / gear: ${$("#capeMethod").selectedOptions[0]?.textContent||""}\nPrice: ${$("#capePrice").textContent} / ${$("#capeGpPrice").textContent}`);
}
function refreshCapeMethods(){
 const rows=pricing.capes.filter(x=>x.name===$("#capeName").value);
 $("#capeMethod").innerHTML=rows.map((x,i)=>`<option value="${i}">${x.method}</option>`).join("");updateCapePrice();
}
function updateCapePrice(){
 const rows=pricing.capes.filter(x=>x.name===$("#capeName").value);
 const row=rows[Number($("#capeMethod").value)||0];
 $("#capePrice").textContent=row?fmtMoney(row.usd):"—";
 $("#capeGpPrice").textContent=row?fmtGp(row.usd/pricing.displayGpRate):"—";
}

async function loadManagedSiteData(){
 try{
  const response=await fetch('/api/site-data',{headers:{accept:'application/json'}});
  if(!response.ok)return;
  const data=await response.json();
  if(Array.isArray(data.accounts))accounts=data.accounts.filter(a=>a.status!=="sold");
  if(Array.isArray(data.accounts))soldAccounts=data.accounts.filter(a=>a.status==="sold");
  if(data.settings){document.querySelectorAll('a[href*="discord.gg"]').forEach(a=>{if(data.settings.discord)a.href=data.settings.discord});document.querySelectorAll('a[href*="sell.app"]').forEach(a=>{if(data.settings.sellapp)a.href=data.settings.sellapp})}
  if(data.announcement?.enabled&&data.announcement.text){window.setTimeout(()=>notify(data.announcement.text),700)}
 }catch(err){console.info('Using bundled website data. Admin API is not configured yet.')}
}
async function loadLivePricing(){try{const r=await fetch('/api/pricing',{headers:{accept:'application/json'}});if(r.ok){const p=await r.json();if(p&&Array.isArray(p.quests)&&p.quests.length)pricing=p}}catch(e){console.info('Using bundled prices')}}
function visitorId(){let v=localStorage.getItem('ss_visitor');if(!v){v=crypto.randomUUID();localStorage.setItem('ss_visitor',v)}return v}
function trackV5(name,extra={}){fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,page:location.pathname,visitor:visitorId(),referrer:document.referrer||'Direct',...extra}),keepalive:true}).catch(()=>{})}
document.addEventListener('click',e=>{const a=e.target.closest('a,button');if(!a)return;const href=a.getAttribute('href')||'';if(href.includes('discord.gg'))trackV5('discord_click');else if(href.includes('sell.app'))trackV5('sellapp_click');else if(a.closest('.account-card'))trackV5('account_click',{label:a.closest('.account-card')?.querySelector('h3')?.textContent||''});else if(a.closest('#calculator'))trackV5('calculator_click')});
(async()=>{trackV5('pageview');await Promise.all([loadManagedSiteData(),loadLivePricing()]);buildAccounts();renderSoldAccounts();buildSkill();buildQuests();buildMinigames();buildCapes()})();


// Final chat integration and resilient loading behavior
(function(){
  const launcher=document.getElementById('chatLaunch');
  if(launcher){
    launcher.addEventListener('click',()=>{
      if(window.Tawk_API&&typeof window.Tawk_API.maximize==='function') window.Tawk_API.maximize();
      else window.open('https://discord.gg/HkUCNNQtmG','_blank','noopener');
    });
  }

  const saleToast=document.getElementById('recentSaleToast');
  if(saleToast){
    window.setTimeout(()=>saleToast.classList.add('show'),2600);
    saleToast.querySelector('[data-close-sale]')?.addEventListener('click',()=>saleToast.classList.remove('show'));
    window.setTimeout(()=>saleToast.classList.remove('show'),11000);
  }
  // Never allow the loading screen to trap visitors.
  window.setTimeout(()=>document.getElementById('loader')?.classList.add('hidden'),2200);
})();
