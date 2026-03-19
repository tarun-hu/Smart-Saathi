class FamilyMember {
  final String id;
  final String userId;
  final String name;
  final String phone;
  final String? relation;
  final String avatar;
  final String role;

  FamilyMember({
    required this.id,
    required this.userId,
    required this.name,
    required this.phone,
    this.relation,
    this.avatar = '',
    this.role = 'member',
  });

  factory FamilyMember.fromJson(Map<String, dynamic> json) {
    return FamilyMember(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      name: json['name'] as String,
      phone: json['phone'] as String,
      relation: json['relation'] as String?,
      avatar: json['avatar_url'] as String? ?? '',
      role: json['role'] as String? ?? 'member',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'name': name,
      'phone': phone,
      'relation': relation,
      'avatar_url': avatar,
      'role': role,
    };
  }
}
