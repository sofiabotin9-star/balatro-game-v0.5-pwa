const PRIMARY_SAVE_KEY = 'balatro-private-run-v2'
const BACKUP_SAVE_KEY = 'balatro-private-run-v2-backup'
const LEGACY_SAVE_KEY = 'balatro-private-run-v1'
const SAVE_VERSION = 2

function storageAvailable() {
  try {
    const probe = `${PRIMARY_SAVE_KEY}:probe`
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

function parsePayload(raw, acceptedVersions = [SAVE_VERSION]) {
  if (!raw) return null
  try {
    const payload = JSON.parse(raw)
    if (!payload || !acceptedVersions.includes(payload.version) || !payload.snapshot) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

function writePrimary(payload) {
  localStorage.setItem(PRIMARY_SAVE_KEY, JSON.stringify(payload))
}

function migrateLegacyIfPresent() {
  const legacy = parsePayload(localStorage.getItem(LEGACY_SAVE_KEY), [1])
  if (!legacy) return null

  const migrated = {
    version: SAVE_VERSION,
    savedAt: Number.isFinite(legacy.savedAt) ? legacy.savedAt : Date.now(),
    snapshot: legacy.snapshot,
    migratedFrom: 1
  }

  try {
    writePrimary(migrated)
    localStorage.removeItem(LEGACY_SAVE_KEY)
  } catch (error) {
    console.warn('[save-game] v1 存档迁移未能写回，但本次仍可读取', error)
  }
  return migrated
}

export function saveRun(snapshot) {
  if (!storageAvailable()) return false

  try {
    const currentPrimary = parsePayload(localStorage.getItem(PRIMARY_SAVE_KEY))
    if (currentPrimary) {
      // 每次覆盖主存档前，把上一个完整存档旋转到备份槽。
      localStorage.setItem(BACKUP_SAVE_KEY, JSON.stringify(currentPrimary))
    }

    const payload = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      snapshot
    }

    writePrimary(payload)
    return true
  } catch (error) {
    console.error('[save-game] 保存失败', error)
    return false
  }
}

export function loadRun() {
  if (!storageAvailable()) return null

  const primary = parsePayload(localStorage.getItem(PRIMARY_SAVE_KEY))
  if (primary) {
    return { ...primary, recoveredFromBackup: false }
  }

  const backup = parsePayload(localStorage.getItem(BACKUP_SAVE_KEY))
  if (backup) {
    try {
      writePrimary(backup)
    } catch (error) {
      console.warn('[save-game] 备份存档可读取，但回写主槽失败', error)
    }
    return { ...backup, recoveredFromBackup: true }
  }

  const migrated = migrateLegacyIfPresent()
  if (migrated) {
    return { ...migrated, recoveredFromBackup: false }
  }

  return null
}

export function clearRun() {
  if (!storageAvailable()) return false

  try {
    localStorage.removeItem(PRIMARY_SAVE_KEY)
    localStorage.removeItem(BACKUP_SAVE_KEY)
    localStorage.removeItem(LEGACY_SAVE_KEY)
    return true
  } catch {
    return false
  }
}

export function getSaveMeta() {
  const payload = loadRun()
  if (!payload) return null

  return {
    savedAt: payload.savedAt,
    phase: payload.snapshot?.runPhase ?? null,
    ante: payload.snapshot?.currentAnte ?? null,
    money: payload.snapshot?.money ?? null,
    recoveredFromBackup: !!payload.recoveredFromBackup
  }
}

export const SAVE_SCHEMA_VERSION = SAVE_VERSION
