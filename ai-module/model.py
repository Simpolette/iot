import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression  # Changed to LogisticRegression
from sklearn.metrics import accuracy_score, classification_report # Changed metrics

import joblib

df = pd.read_csv('weather.csv')
df = df[df['province'] == "Ho Chi Minh City"].copy()

df['avg_temp'] = (df['max'] + df['min']) / 2

df['rain_class'] = (df['rain'] > 0).astype(int)

data = df[['avg_temp', 'humidi', 'rain_class']].dropna()

X = data[['avg_temp', 'humidi']].values
y = data['rain_class'].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=100, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print(f"Training set size: {X_train.shape[0]}")
print(f"Test set size: {X_test.shape[0]}")
print(f"Accuracy on test set: {accuracy:.2f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['No Rain', 'Rain']))

model_filename = 'weather_model.pkl'
joblib.dump(model, model_filename)

print(f"Model saved to {model_filename}")