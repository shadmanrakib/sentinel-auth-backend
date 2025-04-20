// Adapted from https://stackoverflow.com/questions/65434115/how-to-insert-data-in-jsonb-field-of-postgres-using-gorm

package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type JsonDictionary map[string]interface{}

func (j *JsonDictionary) Scan(value interface{}) error {
	data, ok := value.([]byte)
	if !ok {
		return errors.New("Failed to cast value to []bytes")
	}
	return json.Unmarshal(data, &j)
}

func (j JsonDictionary) Value(value interface{}) (driver.Value, error) {
	return json.Marshal(j)
}
