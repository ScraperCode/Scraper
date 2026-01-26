const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

class EnkaNetworkScraper {
    constructor(uid) {
        this.uid = uid;
        this.baseUrl = 'https://enka.network';
        this.url = `${this.baseUrl}/u/${uid}/`;
    }

    generateCookies() {
        const globalToggles = {
            uid: true,
            nickname: true,
            dark: false,
            saveImageToServer: 0,
            substats: false,
            subsBreakdown: false,
            userContent: false,
            adaptiveColor: false,
            profileCategory: 0,
            hideNames: false,
            hoyo_type: 0,
            wedge: false,
            autoOpenSidebar: true,
            lastReadTs: 0,
            snow: false
        };
        
        return {
            globalToggles: encodeURIComponent(JSON.stringify(globalToggles)),
            locale: 'id',
            blacklistedAds: ''
        };
    }

    formatCookies(cookies) {
        return Object.entries(cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');
    }

    async scrape() {
        const cookies = this.generateCookies();
        const cookieString = this.formatCookies(cookies);
        
        const headers = {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Cookie': cookieString,
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36'
        };

        const response = await axios.get(this.url, { headers });
        const $ = cheerio.load(response.data);
        
        return {
            uid: this.uid,
            player: this.extractPlayerInfo($),
            characters: this.extractCharacters($),
            selectedCharacter: this.extractCharacterDetail($),
            rawData: this.extractRawData($)
        };
    }

    extractPlayerInfo($) {
        const playerDiv = $('.PlayerInfo');
        
        const nickname = playerDiv.find('h1').text().trim();
        const arText = playerDiv.find('.ar').text().trim();
        const arMatch = arText.match(/AR\s*(\d+)/);
        const wlMatch = arText.match(/WL\s*(\d+)/);
        
        const stats = {};
        $('.stats table tr').each((i, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 3) {
                const value = $(cells[0]).text().trim();
                const label = $(cells[2]).text().trim();
                if (value && label) {
                    stats[label] = value;
                }
            }
        });

        const avatarImage = playerDiv.find('.avatar-icon img').attr('src') || '';
        const fullAvatarUrl = avatarImage ? `${this.baseUrl}${avatarImage}` : '';

        return {
            nickname: nickname,
            adventureRank: arMatch ? parseInt(arMatch[1]) : null,
            worldLevel: wlMatch ? parseInt(wlMatch[1]) : null,
            signature: playerDiv.find('.signature').text().trim(),
            stats: stats,
            avatarImage: fullAvatarUrl
        };
    }

    extractCharacters($) {
        const characters = [];
        $('.CharacterList .avatar.live').each((i, avatar) => {
            const $avatar = $(avatar);
            const style = $avatar.find('.chara').attr('style') || '';
            const level = $avatar.find('.level').text().trim();
            const bgImage = style.match(/url\(['"]?([^'")]+)['"]?\)/);
            
            let imageUrl = '';
            if (bgImage) {
                imageUrl = bgImage[1].startsWith('http') ? bgImage[1] : `${this.baseUrl}${bgImage[1]}`;
            }
            
            characters.push({
                index: i,
                level: parseInt(level) || 1,
                characterId: bgImage ? bgImage[1].split('/').pop().replace('UI_AvatarIcon_Side_', '').replace('.png', '') : null,
                imageUrl: imageUrl
            });
        });
        
        return characters;
    }

    extractCharacterDetail($) {
        const card = $('.Card').first();
        if (card.length === 0) {
            return null;
        }
        
        const leftSection = card.find('.section.left');
        const middleSection = card.find('.section.middle');
        const rightSection = card.find('.section.right');
        
        const characterImage = leftSection.find('.shades img').attr('src') || '';
        const fullCharacterImage = characterImage ? `${this.baseUrl}${characterImage}` : '';
        
        return {
            name: leftSection.find('.name').text().split('▴')[0].trim(),
            nickname: leftSection.find('.name span').text().replace('▴', '').trim(),
            level: this.extractLevel(leftSection.find('.level').text()),
            friendship: leftSection.find('.fren').text().trim(),
            characterImage: fullCharacterImage,
            weapon: this.extractWeapon(middleSection, $),
            stats: this.extractStats(middleSection, $),
            artifacts: this.extractArtifacts(rightSection, $),
            talents: this.extractTalents(leftSection, $),
            constellations: this.extractConstellations(leftSection, $)
        };
    }

    extractWeapon(section, $) {
        const weaponDiv = section.find('.Weapon');
        if (weaponDiv.length === 0) return null;
        
        const weaponImage = weaponDiv.find('.WeaponIcon').attr('src') || '';
        const fullWeaponImage = weaponImage ? `${this.baseUrl}${weaponImage}` : '';
        
        const levelText = weaponDiv.find('.level').text();
        const levelParts = levelText.split('/');
        
        return {
            name: weaponDiv.find('.title span').text().trim(),
            level: levelParts[0] ? levelParts[0].replace('Lv.', '').trim() : '',
            maxLevel: levelParts[1] ? levelParts[1].trim() : '',
            refinement: weaponDiv.find('.refine').text().trim(),
            baseAttack: weaponDiv.find('.Substat.ATTACK span').last().text().trim(),
            substat: {
                value: weaponDiv.find('.Substat.PHYSICAL_ADD_HURT span').last().text().trim()
            },
            stars: weaponDiv.find('.Stars span').length,
            imageUrl: fullWeaponImage
        };
    }

    extractStats(section, $) {
        const stats = {};
        section.find('.StatsTable .row').each((i, row) => {
            const $row = $(row);
            const statName = $row.find('.mid span').first().text().trim();
            const statValue = $row.find('.mid span').last().text().trim();
            if (statName && statValue) {
                stats[statName] = statValue;
            }
        });
        return stats;
    }

    extractArtifacts(section, $) {
        const artifacts = [];
        section.find('.Artifact').each((i, artifact) => {
            const $artifact = $(artifact);
            const mainstatDiv = $artifact.find('.mainstat');
            
            const mainStatValue = mainstatDiv.find('div').first().text().trim();
            const mainStatType = mainstatDiv.attr('class') || '';
            const mainStatTypeClean = mainStatType.replace('mainstat', '').replace(/\s+/g, '').trim();
            
            const substats = [];
            $artifact.find('.substats .Substat').each((j, substat) => {
                const $substat = $(substat);
                const statType = $substat.attr('class') || '';
                const statTypeClean = statType.replace('Substat', '').replace(/\s+/g, '').trim();
                
                substats.push({
                    type: statTypeClean,
                    value: $substat.find('span').last().text().trim(),
                    rollQuality: $substat.hasClass('meh') ? 'low' : 'high'
                });
            });
            
            artifacts.push({
                slot: i + 1,
                slotName: this.getArtifactSlotName(i),
                mainStat: {
                    type: mainStatTypeClean,
                    value: mainStatValue
                },
                level: mainstatDiv.find('.level').text().trim(),
                stars: mainstatDiv.find('.Stars span').length,
                substats: substats
            });
        });
        return artifacts;
    }

    getArtifactSlotName(index) {
        const slotNames = ['Flower', 'Feather', 'Sands', 'Goblet', 'Circlet'];
        return slotNames[index] || `Slot ${index + 1}`;
    }

    extractTalents(section, $) {
        const talents = [];
        section.find('.Talents .icon').each((i, talent) => {
            const $talent = $(talent);
            const levelText = $talent.find('.level').text();
            const level = levelText.replace('up', '').trim();
            
            const talentImage = $talent.find('img').attr('src') || '';
            const fullTalentImage = talentImage ? `${this.baseUrl}${talentImage}` : '';
            
            const talentTypes = ['Normal Attack', 'Elemental Skill', 'Elemental Burst'];
            talents.push({
                type: talentTypes[i] || `Talent ${i + 1}`,
                level: parseInt(level) || 1,
                upgraded: $talent.find('.level').hasClass('up'),
                imageUrl: fullTalentImage
            });
        });
        return talents;
    }

    extractConstellations(section, $) {
        const constellations = [];
        section.find('.Consts .icon').each((i, constIcon) => {
            const $constIcon = $(constIcon);
            const constImage = $constIcon.find('img').attr('src') || '';
            const fullConstImage = constImage ? `${this.baseUrl}${constImage}` : '';
            
            constellations.push({
                number: i + 1,
                unlocked: !$constIcon.hasClass('locked'),
                imageUrl: fullConstImage
            });
        });
        return constellations;
    }

    extractLevel(text) {
        const match = text.match(/Lv\.\s*(\d+)/);
        return match ? parseInt(match[1]) : 1;
    }

    extractRawData($) {
        const scriptContent = $('script').filter(function() {
            return $(this).html() && $(this).html().includes('avatarInfoList');
        }).html();

        if (!scriptContent) return null;

        const dataMatch = scriptContent.match(/data\s*:\s*(\[.*?\])/s);
        if (!dataMatch) return null;

        const dataString = dataMatch[1];
        const cleanData = dataString.replace(/\\"/g, '"').replace(/\\n/g, '');
        const jsonMatch = cleanData.match(/"avatarInfoList":\s*(\[.*?\])/s);
        
        if (jsonMatch) {
            return JSON.parse(`{${jsonMatch[0]}}`);
        }
        
        return null;
    }
}

(async () => {
    const scraper = new EnkaNetworkScraper('886567006');
    const result = await scraper.scrape();
    console.log(JSON.stringify(result, null, 2));
})();
