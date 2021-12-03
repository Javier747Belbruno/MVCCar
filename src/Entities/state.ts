// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#7-client-state
//import { updateLeaderboard } from './leaderboard';

// The "current" state will always be RENDER_DELAY ms behind server time.
// This makes gameplay smoother and lag less noticeable.
export class State {


RENDER_DELAY = 100;

gameUpdates: any[] = [];
gameStart = 0;
firstServerTimestamp = 0;

public initState() {
  this.gameStart = 0;
  this.firstServerTimestamp = 0;
}

public processGameUpdate(update: { t: number; }) {
  if (!this.firstServerTimestamp) {
    this.firstServerTimestamp = update.t;
    this.gameStart = Date.now();
  }
  this.gameUpdates.push(update);

  //updateLeaderboard(update.leaderboard);

  // Keep only one game update before the current server time
  const base = this.getBaseUpdate();
  if (base > 0) {
    this.gameUpdates.splice(0, base);
  }
}

public currentServerTime() {
  return this.firstServerTimestamp + (Date.now() - this.gameStart) - this.RENDER_DELAY;
}

// Returns the index of the base update, the first game update before
//current server time, or -1 if N/A.
public getBaseUpdate() {
  const serverTime = this.currentServerTime();
  for (let i = this.gameUpdates.length - 1; i >= 0; i--) {
    if (this.gameUpdates[i].t <= serverTime) {
      return i;
    }
  }
  return -1;
}

// Returns { me, others, bullets }
public getCurrentState() {
  if (!this.firstServerTimestamp) {
    return {};
  }

  const base = this.getBaseUpdate();
  //const serverTime = this.currentServerTime();

  // If base is the most recent update we have, use its state.
  // Otherwise, interpolate between its state and the state of (base + 1).
  if (base < 0 || base === this.gameUpdates.length - 1) {
    return this.gameUpdates[this.gameUpdates.length - 1];
  } else {
    //const baseUpdate = this.gameUpdates[base];
    //const next = this.gameUpdates[base + 1];
    //const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
    return {
      /*me: interpolateObject(baseUpdate.me, next.me, ratio),
      others: interpolateObjectArray(baseUpdate.others, next.others, ratio),
      bullets: interpolateObjectArray(baseUpdate.bullets, next.bullets, ratio),*/
    };
  }
}
/*
function interpolateObject(object1, object2, ratio) {
  if (!object2) {
    return object1;
  }

  const interpolated = {};
  Object.keys(object1).forEach(key => {
    if (key === 'direction') {
      interpolated[key] = interpolateDirection(object1[key], object2[key], ratio);
    } else {
      interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
    }
  });
  return interpolated;
}

function interpolateObjectArray(objects1, objects2, ratio) {
  return objects1.map(o => interpolateObject(o, objects2.find(o2 => o.id === o2.id), ratio));
}

// Determines the best way to rotate (cw or ccw) when interpolating a direction.
// For example, when rotating from -3 radians to +3 radians, we should really rotate from
// -3 radians to +3 - 2pi radians.
function interpolateDirection(d1, d2, ratio) {
  const absD = Math.abs(d2 - d1);
  if (absD >= Math.PI) {
    // The angle between the directions is large - we should rotate the other way
    if (d1 > d2) {
      return d1 + (d2 + 2 * Math.PI - d1) * ratio;
    } else {
      return d1 - (d2 - 2 * Math.PI - d1) * ratio;
    }
  } else {
    // Normal interp
    return d1 + (d2 - d1) * ratio;
  }
}*/
}
