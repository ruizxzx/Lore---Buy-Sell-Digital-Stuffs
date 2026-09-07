sed -i "s/incoming().createdAt == request.time.toMillis()/incoming().createdAt >= request.time.toMillis() - 600000 \&\& incoming().createdAt <= request.time.toMillis() + 600000/g" firestore.rules
sed -i "s/incoming().updatedAt == request.time.toMillis()/incoming().updatedAt >= request.time.toMillis() - 600000 \&\& incoming().updatedAt <= request.time.toMillis() + 600000/g" firestore.rules
