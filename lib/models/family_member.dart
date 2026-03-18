class FamilyMember {
  final String id;
  final String userId;
  final String name;
  final String phone;
  final String avatar;
  final String role;

  FamilyMember({
    required this.id,
    required this.userId,
    required this.name,
    required this.phone,
    required this.avatar,
    required this.role,
  });

  factory FamilyMember.fromJson(Map<String, dynamic> json) {
    return FamilyMember(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String,
      avatar: json['avatar_url'] ?? '',
      role: json['role'] ?? 'member',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'phone': phone,
      'avatar_url': avatar,
      'role': role,
    };
  }
}
