/**
 * Preset Level Data for Marble Game
 * Each level uses super bouncer shapes with strategic gaps and moving elements
 * Focus: Trapping marbles, alternating motions, small holes for suspenseful elimination
 */

const PRESET_LEVELS = {
    'level1': {
        name: 'The Trap Chamber',
        difficulty: 'Medium',
        description: 'Dense horizontal bouncer walls with microscopic gaps that shift position. Marbles must wait for perfect alignment!',
        shapes: [
            // First crusher line - dense formation moving right
            { type: 'bouncer', x: 40, y: 200, size: 32, color: '#4CAF50', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 100, y: 200, size: 32, color: '#4CAF50', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 160, y: 200, size: 32, color: '#4CAF50', moving: true, speed: 1.0, direction: 'right' },
            // 10px micro-gap
            { type: 'bouncer', x: 230, y: 200, size: 32, color: '#4CAF50', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 290, y: 200, size: 32, color: '#4CAF50', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 350, y: 200, size: 32, color: '#4CAF50', moving: true, speed: 1.0, direction: 'right' },
            
            // Second crusher line - moving left with offset gap
            { type: 'bouncer', x: 70, y: 280, size: 32, color: '#2196F3', moving: true, speed: 1.2, direction: 'left' },
            { type: 'bouncer', x: 130, y: 280, size: 32, color: '#2196F3', moving: true, speed: 1.2, direction: 'left' },
            { type: 'bouncer', x: 190, y: 280, size: 32, color: '#2196F3', moving: true, speed: 1.2, direction: 'left' },
            { type: 'bouncer', x: 250, y: 280, size: 32, color: '#2196F3', moving: true, speed: 1.2, direction: 'left' },
            // 8px micro-gap
            { type: 'bouncer', x: 318, y: 280, size: 32, color: '#2196F3', moving: true, speed: 1.2, direction: 'left' },
            
            // Third crusher line - dense wall moving right
            { type: 'bouncer', x: 50, y: 360, size: 32, color: '#FF9800', moving: true, speed: 0.8, direction: 'right' },
            { type: 'bouncer', x: 110, y: 360, size: 32, color: '#FF9800', moving: true, speed: 0.8, direction: 'right' },
            { type: 'bouncer', x: 170, y: 360, size: 32, color: '#FF9800', moving: true, speed: 0.8, direction: 'right' },
            { type: 'bouncer', x: 230, y: 360, size: 32, color: '#FF9800', moving: true, speed: 0.8, direction: 'right' },
            { type: 'bouncer', x: 290, y: 360, size: 32, color: '#FF9800', moving: true, speed: 0.8, direction: 'right' },
            // 7px micro-gap
            { type: 'bouncer', x: 357, y: 360, size: 32, color: '#FF9800', moving: true, speed: 0.8, direction: 'right' },
            
            // Final escape - barely passable
            { type: 'bouncer', x: 180, y: 450, size: 25, color: '#9C27B0', moving: true, speed: 0.3, direction: 'left' },
            { type: 'bouncer', x: 220, y: 450, size: 25, color: '#9C27B0', moving: true, speed: 0.3, direction: 'right' }
        ]
    },
    'level2': {
        name: 'The Pendulum Prison',
        difficulty: 'Hard',
        description: 'Massive vertical crusher columns with tiny escape windows. Dense formations create crushing prison corridors!',
        shapes: [
            // Left crusher column - dense vertical wall
            { type: 'bouncer', x: 80, y: 160, size: 34, color: '#E91E63', moving: true, speed: 0.9, direction: 'right' },
            { type: 'bouncer', x: 80, y: 220, size: 34, color: '#E91E63', moving: true, speed: 0.9, direction: 'right' },
            { type: 'bouncer', x: 80, y: 280, size: 34, color: '#E91E63', moving: true, speed: 0.9, direction: 'right' },
            // 9px micro-gap
            { type: 'bouncer', x: 80, y: 349, size: 34, color: '#E91E63', moving: true, speed: 0.9, direction: 'right' },
            { type: 'bouncer', x: 80, y: 409, size: 34, color: '#E91E63', moving: true, speed: 0.9, direction: 'right' },
            { type: 'bouncer', x: 80, y: 469, size: 34, color: '#E91E63', moving: true, speed: 0.9, direction: 'right' },
            
            // Center crusher column - massive wall moving left
            { type: 'bouncer', x: 200, y: 140, size: 34, color: '#673AB7', moving: true, speed: 1.1, direction: 'left' },
            { type: 'bouncer', x: 200, y: 200, size: 34, color: '#673AB7', moving: true, speed: 1.1, direction: 'left' },
            { type: 'bouncer', x: 200, y: 260, size: 34, color: '#673AB7', moving: true, speed: 1.1, direction: 'left' },
            { type: 'bouncer', x: 200, y: 320, size: 34, color: '#673AB7', moving: true, speed: 1.1, direction: 'left' },
            { type: 'bouncer', x: 200, y: 380, size: 34, color: '#673AB7', moving: true, speed: 1.1, direction: 'left' },
            // 8px micro-gap
            { type: 'bouncer', x: 200, y: 448, size: 34, color: '#673AB7', moving: true, speed: 1.1, direction: 'left' },
            { type: 'bouncer', x: 200, y: 508, size: 34, color: '#673AB7', moving: true, speed: 1.1, direction: 'left' },
            
            // Right crusher column - dense formation
            { type: 'bouncer', x: 320, y: 150, size: 34, color: '#FF5722', moving: true, speed: 0.7, direction: 'right' },
            { type: 'bouncer', x: 320, y: 210, size: 34, color: '#FF5722', moving: true, speed: 0.7, direction: 'right' },
            { type: 'bouncer', x: 320, y: 270, size: 34, color: '#FF5722', moving: true, speed: 0.7, direction: 'right' },
            { type: 'bouncer', x: 320, y: 330, size: 34, color: '#FF5722', moving: true, speed: 0.7, direction: 'right' },
            { type: 'bouncer', x: 320, y: 390, size: 34, color: '#FF5722', moving: true, speed: 0.7, direction: 'right' },
            { type: 'bouncer', x: 320, y: 450, size: 34, color: '#FF5722', moving: true, speed: 0.7, direction: 'right' },
            // 7px micro-gap
            { type: 'bouncer', x: 320, y: 517, size: 34, color: '#FF5722', moving: true, speed: 0.7, direction: 'right' }
        ]
    },
    'level3': {
        name: 'The Spiral Vortex',
        difficulty: 'Expert',
        description: 'Dense concentric crusher rings with microscopic spiral gaps. Massive bouncer formations create an inescapable vortex!',
        shapes: [
            // Outer crusher ring - dense large bouncers
            { type: 'bouncer', x: 200, y: 130, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 290, y: 160, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 350, y: 230, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 370, y: 310, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 350, y: 390, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 290, y: 460, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 200, y: 490, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 110, y: 460, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 50, y: 390, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 30, y: 310, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 50, y: 230, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            // 6px gap in outer ring
            { type: 'bouncer', x: 110, y: 160, size: 36, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            
            // Middle crusher ring - dense formation moving opposite
            { type: 'bouncer', x: 200, y: 180, size: 33, color: '#4CAF50', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 260, y: 210, size: 33, color: '#4CAF50', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 300, y: 270, size: 33, color: '#4CAF50', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 300, y: 340, size: 33, color: '#4CAF50', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 260, y: 400, size: 33, color: '#4CAF50', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 200, y: 430, size: 33, color: '#4CAF50', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 140, y: 400, size: 33, color: '#4CAF50', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 100, y: 340, size: 33, color: '#4CAF50', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 100, y: 270, size: 33, color: '#4CAF50', moving: true, speed: 0.8, direction: 'left' },
            // 5px gap in middle ring
            { type: 'bouncer', x: 140, y: 210, size: 33, color: '#4CAF50', moving: true, speed: 0.8, direction: 'left' },
            
            // Inner crusher core - massive central obstacles
            { type: 'bouncer', x: 200, y: 250, size: 30, color: '#2196F3', moving: true, speed: 0.4, direction: 'right' },
            { type: 'bouncer', x: 240, y: 290, size: 30, color: '#2196F3', moving: true, speed: 0.4, direction: 'right' },
            { type: 'bouncer', x: 240, y: 340, size: 30, color: '#2196F3', moving: true, speed: 0.4, direction: 'right' },
            { type: 'bouncer', x: 200, y: 380, size: 30, color: '#2196F3', moving: true, speed: 0.4, direction: 'right' },
            { type: 'bouncer', x: 160, y: 340, size: 30, color: '#2196F3', moving: true, speed: 0.4, direction: 'right' },
            // 4px gap in inner core
            { type: 'bouncer', x: 160, y: 290, size: 30, color: '#2196F3', moving: true, speed: 0.4, direction: 'right' }
        ]
    },
    'level4': {
        name: 'The Maze Lock',
        difficulty: 'Expert',
        description: 'Dense grid of massive moving crusher walls with microscopic escape routes. Multi-layered crushing maze formations!',
        shapes: [
            // First crusher layer - dense horizontal wall
            { type: 'bouncer', x: 30, y: 180, size: 35, color: '#9C27B0', moving: true, speed: 1.0, direction: 'left' },
            { type: 'bouncer', x: 90, y: 180, size: 35, color: '#9C27B0', moving: true, speed: 1.0, direction: 'left' },
            { type: 'bouncer', x: 150, y: 180, size: 35, color: '#9C27B0', moving: true, speed: 1.0, direction: 'left' },
            { type: 'bouncer', x: 210, y: 180, size: 35, color: '#9C27B0', moving: true, speed: 1.0, direction: 'left' },
            // 8px micro-escape
            { type: 'bouncer', x: 283, y: 180, size: 35, color: '#9C27B0', moving: true, speed: 1.0, direction: 'left' },
            { type: 'bouncer', x: 343, y: 180, size: 35, color: '#9C27B0', moving: true, speed: 1.0, direction: 'left' },
            
            // Second crusher layer - dense wall moving right
            { type: 'bouncer', x: 60, y: 250, size: 35, color: '#795548', moving: true, speed: 1.2, direction: 'right' },
            { type: 'bouncer', x: 120, y: 250, size: 35, color: '#795548', moving: true, speed: 1.2, direction: 'right' },
            { type: 'bouncer', x: 180, y: 250, size: 35, color: '#795548', moving: true, speed: 1.2, direction: 'right' },
            { type: 'bouncer', x: 240, y: 250, size: 35, color: '#795548', moving: true, speed: 1.2, direction: 'right' },
            { type: 'bouncer', x: 300, y: 250, size: 35, color: '#795548', moving: true, speed: 1.2, direction: 'right' },
            // 7px micro-escape
            { type: 'bouncer', x: 367, y: 250, size: 35, color: '#795548', moving: true, speed: 1.2, direction: 'right' },
            
            // Third crusher layer - massive wall formation
            { type: 'bouncer', x: 40, y: 320, size: 35, color: '#607D8B', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 100, y: 320, size: 35, color: '#607D8B', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 160, y: 320, size: 35, color: '#607D8B', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 220, y: 320, size: 35, color: '#607D8B', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 280, y: 320, size: 35, color: '#607D8B', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 340, y: 320, size: 35, color: '#607D8B', moving: true, speed: 0.8, direction: 'left' },
            
            // Fourth crusher layer - dense formation
            { type: 'bouncer', x: 50, y: 390, size: 35, color: '#3F51B5', moving: true, speed: 1.1, direction: 'right' },
            { type: 'bouncer', x: 110, y: 390, size: 35, color: '#3F51B5', moving: true, speed: 1.1, direction: 'right' },
            { type: 'bouncer', x: 170, y: 390, size: 35, color: '#3F51B5', moving: true, speed: 1.1, direction: 'right' },
            { type: 'bouncer', x: 230, y: 390, size: 35, color: '#3F51B5', moving: true, speed: 1.1, direction: 'right' },
            // 6px micro-escape
            { type: 'bouncer', x: 296, y: 390, size: 35, color: '#3F51B5', moving: true, speed: 1.1, direction: 'right' },
            { type: 'bouncer', x: 356, y: 390, size: 35, color: '#3F51B5', moving: true, speed: 1.1, direction: 'right' },
            
            // Final crusher escape - barely passable
            { type: 'bouncer', x: 170, y: 470, size: 28, color: '#E91E63', moving: true, speed: 0.3, direction: 'left' },
            { type: 'bouncer', x: 230, y: 470, size: 28, color: '#E91E63', moving: true, speed: 0.3, direction: 'right' }
        ]
    },
    'level5': {
        name: 'The Pinball Nightmare',
        difficulty: 'Insane',
        description: 'Dense crusher formations scattered randomly with microscopic gaps. Massive bouncer chaos creates an inescapable nightmare!',
        shapes: [
            // Random dense crusher placements with large bouncers
            { type: 'bouncer', x: 70, y: 150, size: 38, color: '#F44336', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 180, y: 170, size: 36, color: '#E91E63', moving: true, speed: 0.7, direction: 'left' },
            { type: 'bouncer', x: 310, y: 190, size: 40, color: '#9C27B0', moving: true, speed: 1.3, direction: 'right' },
            
            { type: 'bouncer', x: 40, y: 230, size: 34, color: '#673AB7', moving: true, speed: 0.9, direction: 'left' },
            { type: 'bouncer', x: 140, y: 250, size: 37, color: '#3F51B5', moving: true, speed: 1.1, direction: 'right' },
            { type: 'bouncer', x: 250, y: 210, size: 35, color: '#2196F3', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 340, y: 270, size: 39, color: '#03A9F4', moving: true, speed: 1.2, direction: 'right' },
            
            { type: 'bouncer', x: 90, y: 310, size: 33, color: '#00BCD4', moving: true, speed: 0.6, direction: 'left' },
            { type: 'bouncer', x: 200, y: 330, size: 41, color: '#009688', moving: true, speed: 1.4, direction: 'right' },
            { type: 'bouncer', x: 320, y: 350, size: 32, color: '#4CAF50', moving: true, speed: 0.9, direction: 'left' },
            
            { type: 'bouncer', x: 60, y: 390, size: 36, color: '#8BC34A', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 160, y: 410, size: 38, color: '#CDDC39', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 270, y: 430, size: 34, color: '#FFEB3B', moving: true, speed: 1.1, direction: 'right' },
            
            { type: 'bouncer', x: 120, y: 470, size: 30, color: '#FFC107', moving: true, speed: 0.5, direction: 'left' },
            { type: 'bouncer', x: 240, y: 490, size: 32, color: '#FF9800', moving: true, speed: 0.7, direction: 'right' },
            
            // Final crusher gaps - barely passable
            { type: 'bouncer', x: 100, y: 530, size: 26, color: '#FF5722', moving: true, speed: 0.3, direction: 'left' },
            { type: 'bouncer', x: 300, y: 550, size: 26, color: '#795548', moving: true, speed: 0.3, direction: 'right' }
        ]
    },
    'level6': {
        name: 'The Time Trap',
        difficulty: 'Insane',
        description: 'Synchronized crusher waves that create brief microscopic windows. Dense bouncer walls move in perfect formation!',
        shapes: [
            // First sync crusher wave - massive bouncers moving together
            { type: 'bouncer', x: 20, y: 170, size: 36, color: '#E53935', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 80, y: 170, size: 36, color: '#E53935', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 140, y: 170, size: 36, color: '#E53935', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 200, y: 170, size: 36, color: '#E53935', moving: true, speed: 1.0, direction: 'right' },
            // 6px sync gap
            { type: 'bouncer', x: 266, y: 170, size: 36, color: '#E53935', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 326, y: 170, size: 36, color: '#E53935', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 386, y: 170, size: 36, color: '#E53935', moving: true, speed: 1.0, direction: 'right' },
            
            // Second sync crusher wave - dense formation moving left
            { type: 'bouncer', x: 60, y: 240, size: 36, color: '#1E88E5', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 120, y: 240, size: 36, color: '#1E88E5', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 180, y: 240, size: 36, color: '#1E88E5', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 240, y: 240, size: 36, color: '#1E88E5', moving: true, speed: 0.8, direction: 'left' },
            { type: 'bouncer', x: 300, y: 240, size: 36, color: '#1E88E5', moving: true, speed: 0.8, direction: 'left' },
            // 5px sync gap
            { type: 'bouncer', x: 365, y: 240, size: 36, color: '#1E88E5', moving: true, speed: 0.8, direction: 'left' },
            
            // Third sync crusher wave - massive wall
            { type: 'bouncer', x: 30, y: 310, size: 36, color: '#43A047', moving: true, speed: 1.2, direction: 'right' },
            { type: 'bouncer', x: 90, y: 310, size: 36, color: '#43A047', moving: true, speed: 1.2, direction: 'right' },
            { type: 'bouncer', x: 150, y: 310, size: 36, color: '#43A047', moving: true, speed: 1.2, direction: 'right' },
            { type: 'bouncer', x: 210, y: 310, size: 36, color: '#43A047', moving: true, speed: 1.2, direction: 'right' },
            { type: 'bouncer', x: 270, y: 310, size: 36, color: '#43A047', moving: true, speed: 1.2, direction: 'right' },
            { type: 'bouncer', x: 330, y: 310, size: 36, color: '#43A047', moving: true, speed: 1.2, direction: 'right' },
            
            // Fourth sync crusher wave - dense formation
            { type: 'bouncer', x: 70, y: 380, size: 36, color: '#FB8C00', moving: true, speed: 0.9, direction: 'left' },
            { type: 'bouncer', x: 130, y: 380, size: 36, color: '#FB8C00', moving: true, speed: 0.9, direction: 'left' },
            { type: 'bouncer', x: 190, y: 380, size: 36, color: '#FB8C00', moving: true, speed: 0.9, direction: 'left' },
            { type: 'bouncer', x: 250, y: 380, size: 36, color: '#FB8C00', moving: true, speed: 0.9, direction: 'left' },
            { type: 'bouncer', x: 310, y: 380, size: 36, color: '#FB8C00', moving: true, speed: 0.9, direction: 'left' },
            // 4px sync gap
            { type: 'bouncer', x: 374, y: 380, size: 36, color: '#FB8C00', moving: true, speed: 0.9, direction: 'left' },
            
            // Final sync challenge - ultra-narrow crusher escape
            { type: 'bouncer', x: 170, y: 460, size: 28, color: '#8E24AA', moving: true, speed: 0.2, direction: 'right' },
            { type: 'bouncer', x: 230, y: 460, size: 28, color: '#8E24AA', moving: true, speed: 0.2, direction: 'left' }
        ]
    },
    'level7': {
        name: 'The Crusher',
        difficulty: 'Nightmare',
        description: 'Massive moving walls of bouncers with microscopic gaps. Only the most patient marbles will find their way through the crushing corridors!',
        shapes: [
            // First crusher wall - dense formation moving right
            { type: 'bouncer', x: 30, y: 160, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 90, y: 160, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 150, y: 160, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            // 12px micro-escape
            { type: 'bouncer', x: 222, y: 160, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 282, y: 160, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 342, y: 160, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            
            { type: 'bouncer', x: 30, y: 220, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 90, y: 220, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 150, y: 220, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            // Same 12px gap
            { type: 'bouncer', x: 222, y: 220, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 282, y: 220, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            { type: 'bouncer', x: 342, y: 220, size: 35, color: '#D32F2F', moving: true, speed: 1.0, direction: 'right' },
            
            // Second crusher wall - dense formation moving left, offset position
            { type: 'bouncer', x: 60, y: 300, size: 35, color: '#1976D2', moving: true, speed: 1.2, direction: 'left' },
            { type: 'bouncer', x: 120, y: 300, size: 35, color: '#1976D2', moving: true, speed: 1.2, direction: 'left' },
            { type: 'bouncer', x: 180, y: 300, size: 35, color: '#1976D2', moving: true, speed: 1.2, direction: 'left' },
            { type: 'bouncer', x: 240, y: 300, size: 35, color: '#1976D2', moving: true, speed: 1.2, direction: 'left' },
            // 10px micro-escape
            { type: 'bouncer', x: 315, y: 300, size: 35, color: '#1976D2', moving: true, speed: 1.2, direction: 'left' },
            
            { type: 'bouncer', x: 60, y: 360, size: 35, color: '#1976D2', moving: true, speed: 1.2, direction: 'left' },
            { type: 'bouncer', x: 120, y: 360, size: 35, color: '#1976D2', moving: true, speed: 1.2, direction: 'left' },
            { type: 'bouncer', x: 180, y: 360, size: 35, color: '#1976D2', moving: true, speed: 1.2, direction: 'left' },
            { type: 'bouncer', x: 240, y: 360, size: 35, color: '#1976D2', moving: true, speed: 1.2, direction: 'left' },
            // Same 10px gap
            { type: 'bouncer', x: 315, y: 360, size: 35, color: '#1976D2', moving: true, speed: 1.2, direction: 'left' },
            
            // Third crusher wall - moving right, even denser
            { type: 'bouncer', x: 40, y: 450, size: 35, color: '#388E3C', moving: true, speed: 0.8, direction: 'right' },
            { type: 'bouncer', x: 100, y: 450, size: 35, color: '#388E3C', moving: true, speed: 0.8, direction: 'right' },
            { type: 'bouncer', x: 160, y: 450, size: 35, color: '#388E3C', moving: true, speed: 0.8, direction: 'right' },
            { type: 'bouncer', x: 220, y: 450, size: 35, color: '#388E3C', moving: true, speed: 0.8, direction: 'right' },
            { type: 'bouncer', x: 280, y: 450, size: 35, color: '#388E3C', moving: true, speed: 0.8, direction: 'right' },
            // 8px micro-escape - barely passable
            { type: 'bouncer', x: 348, y: 450, size: 35, color: '#388E3C', moving: true, speed: 0.8, direction: 'right' },
            
            // Final escape - barely movable
            { type: 'bouncer', x: 190, y: 530, size: 25, color: '#F57C00', moving: true, speed: 0.2, direction: 'left' },
            { type: 'bouncer', x: 230, y: 530, size: 25, color: '#F57C00', moving: true, speed: 0.2, direction: 'right' }
        ]
    },
    'level8': {
        name: 'The Perfect Storm',
        difficulty: 'Impossible',
        description: 'The ultimate challenge - every marble retention technique combined. Multi-layered traps, synchronized waves, micro-gaps, and chaotic movement patterns!',
        shapes: [
            // Top chaos layer - random fast movement
            { type: 'bouncer', x: 70, y: 140, size: 22, color: '#FF1744', moving: true, speed: 2.8, direction: 'right' },
            { type: 'bouncer', x: 130, y: 160, size: 24, color: '#FF1744', moving: true, speed: 1.9, direction: 'left' },
            { type: 'bouncer', x: 200, y: 140, size: 23, color: '#FF1744', moving: true, speed: 2.5, direction: 'right' },
            { type: 'bouncer', x: 270, y: 160, size: 22, color: '#FF1744', moving: true, speed: 1.7, direction: 'left' },
            { type: 'bouncer', x: 330, y: 150, size: 25, color: '#FF1744', moving: true, speed: 2.3, direction: 'right' },
            
            // Synchronized wave trap
            { type: 'bouncer', x: 50, y: 220, size: 30, color: '#3F51B5', moving: true, speed: 2.0, direction: 'right' },
            { type: 'bouncer', x: 110, y: 220, size: 30, color: '#3F51B5', moving: true, speed: 2.0, direction: 'right' },
            { type: 'bouncer', x: 170, y: 220, size: 30, color: '#3F51B5', moving: true, speed: 2.0, direction: 'right' },
            // 8px sync gap
            { type: 'bouncer', x: 248, y: 220, size: 30, color: '#3F51B5', moving: true, speed: 2.0, direction: 'right' },
            { type: 'bouncer', x: 308, y: 220, size: 30, color: '#3F51B5', moving: true, speed: 2.0, direction: 'right' },
            
            // Counter-sync wave
            { type: 'bouncer', x: 80, y: 280, size: 30, color: '#E91E63', moving: true, speed: 1.8, direction: 'left' },
            { type: 'bouncer', x: 140, y: 280, size: 30, color: '#E91E63', moving: true, speed: 1.8, direction: 'left' },
            // 9px counter gap
            { type: 'bouncer', x: 219, y: 280, size: 30, color: '#E91E63', moving: true, speed: 1.8, direction: 'left' },
            { type: 'bouncer', x: 279, y: 280, size: 30, color: '#E91E63', moving: true, speed: 1.8, direction: 'left' },
            { type: 'bouncer', x: 339, y: 280, size: 30, color: '#E91E63', moving: true, speed: 1.8, direction: 'left' },
            
            // Dense maze section
            { type: 'bouncer', x: 60, y: 340, size: 28, color: '#4CAF50', moving: true, speed: 1.3, direction: 'right' },
            { type: 'bouncer', x: 120, y: 340, size: 28, color: '#4CAF50', moving: true, speed: 1.3, direction: 'right' },
            { type: 'bouncer', x: 180, y: 340, size: 28, color: '#4CAF50', moving: true, speed: 1.3, direction: 'right' },
            { type: 'bouncer', x: 240, y: 340, size: 28, color: '#4CAF50', moving: true, speed: 1.3, direction: 'right' },
            // 7px maze gap
            { type: 'bouncer', x: 315, y: 340, size: 28, color: '#4CAF50', moving: true, speed: 1.3, direction: 'right' },
            
            // Crusher section with opposite movement
            { type: 'bouncer', x: 40, y: 400, size: 32, color: '#FF9800', moving: true, speed: 0.9, direction: 'left' },
            { type: 'bouncer', x: 100, y: 400, size: 32, color: '#FF9800', moving: true, speed: 0.9, direction: 'left' },
            { type: 'bouncer', x: 160, y: 400, size: 32, color: '#FF9800', moving: true, speed: 0.9, direction: 'left' },
            { type: 'bouncer', x: 220, y: 400, size: 32, color: '#FF9800', moving: true, speed: 0.9, direction: 'left' },
            { type: 'bouncer', x: 280, y: 400, size: 32, color: '#FF9800', moving: true, speed: 0.9, direction: 'left' },
            // 6px crusher gap
            { type: 'bouncer', x: 346, y: 400, size: 32, color: '#FF9800', moving: true, speed: 0.9, direction: 'left' },
            
            // Micro-precision final layer
            { type: 'bouncer', x: 80, y: 470, size: 26, color: '#9C27B0', moving: true, speed: 0.6, direction: 'right' },
            { type: 'bouncer', x: 140, y: 470, size: 26, color: '#9C27B0', moving: true, speed: 0.6, direction: 'right' },
            { type: 'bouncer', x: 200, y: 470, size: 26, color: '#9C27B0', moving: true, speed: 0.6, direction: 'right' },
            // 5px micro gap
            { type: 'bouncer', x: 265, y: 470, size: 26, color: '#9C27B0', moving: true, speed: 0.6, direction: 'right' },
            { type: 'bouncer', x: 325, y: 470, size: 26, color: '#9C27B0', moving: true, speed: 0.6, direction: 'right' },
            
            // Ultra-final escape - barely possible
            { type: 'bouncer', x: 180, y: 530, size: 18, color: '#795548', moving: true, speed: 0.3, direction: 'left' },
            { type: 'bouncer', x: 220, y: 530, size: 18, color: '#795548', moving: true, speed: 0.3, direction: 'right' },
            
            // Last chance static obstacles
            { type: 'bouncer', x: 150, y: 570, size: 15, color: '#607D8B' },
            { type: 'bouncer', x: 250, y: 570, size: 15, color: '#607D8B' }
        ]
    }
};

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PRESET_LEVELS;
} else if (typeof window !== 'undefined') {
    window.PRESET_LEVELS = PRESET_LEVELS;
} 