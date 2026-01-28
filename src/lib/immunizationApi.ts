// Immunization API functions
export async function getImmunizationTracking() {
  try {
    const response = await fetch('/api/immunizations?type=tracking', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch immunization tracking data')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching immunization tracking:', error)
    throw error
  }
}

export async function getImmunizationCoverage() {
  try {
    const response = await fetch('/api/immunizations?type=coverage', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch immunization coverage data')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching immunization coverage:', error)
    throw error
  }
}

export async function deleteImmunization(id: string) {
  try {
    const response = await fetch(`/api/immunizations?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete immunization')
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting immunization:', error)
    throw error
  }
}
